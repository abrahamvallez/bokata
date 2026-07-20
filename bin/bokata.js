#!/usr/bin/env node

const { runInstall } = require('../src/install');

const args = process.argv.slice(2);
const [command, ...rest] = args;

async function main() {
  if (!command || command === 'install') {
    await runInstall(command === 'install' ? rest : args);
    return;
  }

  if (command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exitCode = 1;
}

function printHelp() {
  console.log(`
Bokata — Product Trio SDD framework installer

Usage:
  npx bokata@latest install [options]

Options:
  --claude       Install for Claude Code
  --cursor       Install for Cursor
  --opencode     Install for OpenCode
  --codex        Install for Codex CLI
  --yes, -y      Non-interactive: never prompt, only install what was detected/flagged

Behavior:
  With no harness flags, bokata auto-detects .claude/, .cursor/, .opencode/,
  and .codex/ in the current directory and installs into whichever exist.
  If none are found and --yes was not passed, it asks interactively.

  Re-running "install" is safe — it overwrites previously installed files
  so you can pick up updates.
`);
}

main().catch((err) => {
  console.error(`✖ Install failed: ${err.message}`);
  process.exitCode = 1;
});
