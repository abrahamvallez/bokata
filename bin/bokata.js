#!/usr/bin/env node

const { runInstall, runSync } = require('../src/install');

const args = process.argv.slice(2);
const [command, ...rest] = args;

async function main() {
  if (!command || (command.startsWith('-') && !['-h', '--help'].includes(command))) {
    await runInstall(args);
    return;
  }

  if (command === 'install') {
    await runInstall(rest);
    return;
  }

  if (command === 'sync') {
    await runSync();
    return;
  }

  if (command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exitCode = 1;
}

function printHelp() {
  console.log(`
Bokata — skills and agents for shaping, slicing and building in small steps

Usage:
  npx bokata@latest install [options]   install or update skills, agents and .bokata.json
  npx bokata@latest sync                regenerate agents from .bokata.json (no questions)

Options:
  --claude       Install for Claude Code
  --cursor       Install for Cursor
  --opencode     Install for OpenCode
  --codex        Install for Codex CLI
  --yes, -y      Non-interactive: never prompt, only install what was detected/flagged

Behavior:
  With no harness flags, bokata auto-detects .claude/, .cursor/, .opencode/ (or
  opencode.json) and .codex/ in the current directory and installs into whichever
  exist. If none are found and --yes was not passed, it asks interactively.

  Skills go to .agents/skills/ (symlinked from .claude/skills/ and .cursor/skills/).
  Agents are generated per harness; the model of each role (trio, executor,
  reviewer) is asked at install time and stored in .bokata.json.

  Re-running "install" is safe — it overwrites what bokata installed and removes
  the commands bokata 2.x used to install.
`);
}

main().catch((err) => {
  console.error(`✖ ${err.message}`);
  process.exitCode = 1;
});
