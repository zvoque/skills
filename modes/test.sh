#!/usr/bin/env bash
# Self-test. Runs the hooks against a throwaway HOME so your real ~/.claude is
# never touched. Verifies activation, persistence, deactivation, the settings
# patch (idempotency + caveman preservation), and path-traversal rejection.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SANDBOX="$(mktemp -d)"
trap 'rm -rf "${SANDBOX}"' EXIT
export HOME="${SANDBOX}"

mkdir -p "${HOME}/.claude/hooks"
cp "${SRC}/hooks/"*.js "${HOME}/.claude/hooks/"
cp -R "${SRC}/skills/." "${HOME}/.claude/skills/"

T="${HOME}/.claude/hooks/modes-tracker.js"
A="${HOME}/.claude/hooks/modes-activate.js"
FLAG="${HOME}/.claude/.modes-active"
pass=0; fail=0
ok(){ printf '  \033[32mPASS\033[0m %s\n' "$1"; pass=$((pass+1)); }
no(){ printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=$((fail+1)); }

run(){ printf '%s' "$1" | node "$2"; }   # prompt-json, script -> stdout

echo "== activation =="
out="$(run '{"prompt":"/contrarian"}' "$T")"
[ -f "$FLAG" ] && ok "flag created on /contrarian" || no "flag not created"
echo "$out" | grep -q "CONTRARIAN MODE ACTIVE" && ok "persona injected same turn" || no "no persona injected"
echo "$out" | grep -q "additionalContext" && ok "uses additionalContext envelope" || no "wrong output shape"
echo "$out" | grep -q -- "---" && no "frontmatter leaked" || ok "frontmatter stripped"

echo "== persistence (unrelated next prompt) =="
out="$(run '{"prompt":"what time is it"}' "$T")"
echo "$out" | grep -q "CONTRARIAN MODE ACTIVE" && ok "persona re-injected every turn" || no "did not persist"

echo "== SessionStart resume =="
out="$(printf '%s' '{"source":"resume"}' | node "$A")"
echo "$out" | grep -q "CONTRARIAN MODE ACTIVE" && ok "SessionStart injects when active" || no "SessionStart missed active flag"

echo "== deactivation =="
out="$(run '{"prompt":"stop contrarian"}' "$T")"
[ -f "$FLAG" ] && no "flag survived stop" || ok "flag cleared on stop"
echo "$out" | grep -q "now OFF" && ok "OFF override injected" || no "no OFF override"
out="$(run '{"prompt":"hello again"}' "$T")"
[ -z "$out" ] && ok "no injection after off" || no "still injecting after off"

echo "== normal mode global off =="
run '{"prompt":"/contrarian"}' "$T" >/dev/null
run '{"prompt":"normal mode"}'  "$T" >/dev/null
[ -f "$FLAG" ] && no "normal mode did not turn off" || ok "normal mode turns off"

echo "== false-positive guard =="
run '{"prompt":"explain vim normal mode keybindings"}' "$T" >/dev/null || true
[ -f "$FLAG" ] && no "spurious activation" || ok "no spurious activation from prose"
out="$(run '{"prompt":"/nonexistent"}' "$T")"
[ -f "$FLAG" ] && no "activated unknown mode" || ok "unknown mode ignored"
mkdir -p "${HOME}/.claude/skills/plainskill"
printf -- '---\nname: plainskill\ndescription: x\n---\nbody\n' > "${HOME}/.claude/skills/plainskill/SKILL.md"
run '{"prompt":"/plainskill"}' "$T" >/dev/null
[ -f "$FLAG" ] && no "hijacked ordinary skill as mode" || ok "unmarked skill not a mode"

echo "== path traversal guard =="
printf '../../etc/passwd' > "$FLAG"
out="$(run '{"prompt":"hi"}' "$T")"
[ -z "$out" ] && ok "malformed flag rejected" || no "traversal not blocked"
rm -f "$FLAG"

echo "== settings patch: caveman preserved + idempotent =="
cat > "${HOME}/.claude/settings.json" <<'JSON'
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "node ~/.claude/hooks/caveman-activate.js" } ] }
    ]
  }
}
JSON
node "${HOME}/.claude/hooks/patch-settings.js" >/dev/null
node "${HOME}/.claude/hooks/patch-settings.js" >/dev/null   # second run = no-op
node -e '
const fs=require("fs"),p=process.env.HOME+"/.claude/settings.json";
const s=JSON.parse(fs.readFileSync(p,"utf8"));
const all=JSON.stringify(s);
const cav=(s.hooks.SessionStart||[]).filter(g=>JSON.stringify(g).includes("caveman")).length;
const trk=(s.hooks.UserPromptSubmit||[]).filter(g=>JSON.stringify(g).includes("modes-tracker")).length;
const act=(s.hooks.SessionStart||[]).filter(g=>JSON.stringify(g).includes("modes-activate")).length;
if(cav===1&&trk===1&&act===1)console.log("OK");else{console.error("BAD",{cav,trk,act});process.exit(1);}
' && ok "caveman intact, modes added once (idempotent)" || no "settings patch wrong"

echo
echo "Results: ${pass} passed, ${fail} failed"
[ "$fail" -eq 0 ]
