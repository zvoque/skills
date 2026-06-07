#!/usr/bin/env bash
# Removes the "modes" plugin. Leaves caveman and all other hooks untouched.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${HOME}/.claude"

node -e '
const fs=require("fs"),os=require("os"),path=require("path");
const S=path.join(os.homedir(),".claude","settings.json");
if(!fs.existsSync(S)){console.log("no settings.json");process.exit(0);}
const s=JSON.parse(fs.readFileSync(S,"utf8")||"{}");
const strip=(ev)=>{
  if(!s.hooks||!s.hooks[ev])return;
  s.hooks[ev]=s.hooks[ev].filter(g=>!((g.hooks||[]).some(h=>h&&typeof h.command==="string"&&/modes-(tracker|activate)\.js/.test(h.command))));
  if(s.hooks[ev].length===0)delete s.hooks[ev];
};
strip("UserPromptSubmit");strip("SessionStart");
if(fs.existsSync(S))fs.copyFileSync(S,S+".bak");
fs.writeFileSync(S+".tmp",JSON.stringify(s,null,2)+"\n");
fs.renameSync(S+".tmp",S);
console.log("✓ removed modes hooks from settings.json (backup: "+S+".bak)");
'

rm -f "${CLAUDE_DIR}/hooks/modes-lib.js" \
      "${CLAUDE_DIR}/hooks/modes-tracker.js" \
      "${CLAUDE_DIR}/hooks/modes-activate.js"
for d in "${SRC}"/skills/*/; do
  rm -rf "${CLAUDE_DIR}/skills/$(basename "${d}")"
done
rm -rf "${CLAUDE_DIR}/skills/modes"   # legacy nested layout, if present
rm -f "${CLAUDE_DIR}/.modes-active" "${CLAUDE_DIR}/.modes-debug.log"
echo "✓ removed modes hook scripts, skills, and flag files"
echo "  (caveman's ~/.claude/.caveman-active and its hooks are untouched)"
