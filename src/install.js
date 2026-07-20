const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');

const SKILLS = [
  'bokata-feature-mapper',
  'bokata-feature-slicer',
  'bokata-acceptance-criteria'
];

const AGENTS = [
  'bokata-product-manager',
  'bokata-product-designer',
  'bokata-product-engineer'
];

// Note: bokata-product-coordinator is NOT installed as a subagent.
// The coordinator role is executed by the main thread in all harnesses.
// The coordinator prompt (agents/bokata-product-coordinator.md) exists as
// a reference resource for reconciliation rules, not as an installable agent.

const HARNESS_KEYS = ['claude', 'cursor', 'opencode', 'codex'];

async function runInstall(args) {
  const cwd = process.cwd();
  const flags = parseFlags(args);
  const detected = detectHarnesses(cwd);
  const selected = await resolveHarnesses(flags, detected);

  const activeKeys = HARNESS_KEYS.filter((k) => selected[k]);
  if (activeKeys.length === 0) {
    console.log('Nothing to install — no harness selected.');
    return;
  }

  installSkills(cwd, selected);
  installAgents(cwd, selected);
  installCommands(cwd, selected);

  printSummary(selected);
}

function parseFlags(args) {
  return {
    claude: args.includes('--claude'),
    cursor: args.includes('--cursor'),
    opencode: args.includes('--opencode'),
    codex: args.includes('--codex'),
    yes: args.includes('--yes') || args.includes('-y')
  };
}

function detectHarnesses(cwd) {
  return {
    claude: fs.existsSync(path.join(cwd, '.claude')),
    cursor: fs.existsSync(path.join(cwd, '.cursor')),
    opencode: fs.existsSync(path.join(cwd, '.opencode')),
    codex: fs.existsSync(path.join(cwd, '.codex'))
  };
}

async function resolveHarnesses(flags, detected) {
  const explicit = HARNESS_KEYS.some((k) => flags[k]);
  if (explicit) {
    return {
      claude: flags.claude,
      cursor: flags.cursor,
      opencode: flags.opencode,
      codex: flags.codex
    };
  }

  const anyDetected = HARNESS_KEYS.some((k) => detected[k]);
  if (anyDetected) {
    return detected;
  }

  if (flags.yes) {
    return { claude: false, cursor: false, opencode: false, codex: false };
  }

  return promptForHarnesses();
}

async function promptForHarnesses() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (question) =>
    new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim().toLowerCase())));

  console.log("No .claude/, .cursor/, .opencode/ or .codex/ found in this directory.");
  console.log('Which harness(es) do you want to install Bokata for? (y/n each)\n');

  const selected = {};
  for (const key of HARNESS_KEYS) {
    const answer = await ask(`  ${key}? [y/N] `);
    selected[key] = answer === 'y' || answer === 'yes';
  }

  rl.close();
  return selected;
}

function installSkills(cwd, selected) {
  const installedFor = [];
  for (const key of HARNESS_KEYS) {
    if (!selected[key]) continue;
    for (const skill of SKILLS) {
      const src = path.join(ROOT, '.agents', 'skills', skill);
      const dest = path.join(cwd, `.${key}`, 'skills', skill);
      copyDirRecursive(src, dest);
    }
    installedFor.push(key);
  }
  if (installedFor.length > 0) {
    console.log(`✅ Skills copied to: ${installedFor.map((k) => `.${k}/skills/`).join(', ')}`);
  }
}

function installAgents(cwd, selected) {
  if (selected.claude || selected.cursor) {
    for (const agent of AGENTS) {
      const prompt = fs.readFileSync(path.join(ROOT, 'agents', `${agent}.md`), 'utf8');
      const output = generateNameDescriptionAgent(agent, prompt);
      if (selected.claude) writeFile(path.join(cwd, '.claude', 'agents', `${agent}.md`), output);
      if (selected.cursor) writeFile(path.join(cwd, '.cursor', 'agents', `${agent}.md`), output);
    }
    if (selected.claude) console.log('✅ Agents installed for Claude Code');
    if (selected.cursor) console.log('✅ Agents installed for Cursor');
  }

  if (selected.opencode) {
    for (const agent of AGENTS) {
      const prompt = fs.readFileSync(path.join(ROOT, 'agents', `${agent}.md`), 'utf8');
      const output = generateOpenCodeAgent(agent, prompt);
      writeFile(path.join(cwd, '.opencode', 'agents', `${agent}.md`), output);
    }
    console.log('✅ Agents installed for OpenCode');
  }

  if (selected.codex) {
    for (const agent of AGENTS) {
      const prompt = fs.readFileSync(path.join(ROOT, 'agents', `${agent}.md`), 'utf8');
      const output = generateCodexAgent(agent, prompt);
      writeFile(path.join(cwd, '.codex', 'agents', `${agent}.toml`), output);
    }
    console.log('✅ Agents installed for Codex (project-scoped TOML)');
  }
}

function installCommands(cwd, selected) {
  const taskParallelSrc = path.join(ROOT, 'commands', 'task-parallel');

  if (selected.claude) {
    copyDirRecursive(taskParallelSrc, path.join(cwd, '.claude', 'commands', 'bokata'));
    console.log('✅ Commands installed for Claude Code');
  }

  if (selected.cursor) {
    copyDirStripFrontmatterForTopLevelMd(taskParallelSrc, path.join(cwd, '.cursor', 'commands', 'bokata'));
    console.log('✅ Commands installed for Cursor (frontmatter stripped — unsupported there)');
  }

  if (selected.opencode) {
    // Note the singular "command" directory — OpenCode uses .opencode/agents/ (plural)
    // for agents but .opencode/command/ (singular) for commands.
    copyDirRecursive(taskParallelSrc, path.join(cwd, '.opencode', 'command', 'bokata'));
    console.log('✅ Commands installed for OpenCode');
  }

  if (selected.codex) {
    installCodexCommands(cwd);
  }
}

function installCodexCommands(cwd) {
  // Codex CLI only discovers custom prompts in the global, per-user
  // ~/.codex/prompts/ directory, scanning top-level files only (no
  // subdirectories, no project-local discovery). So unlike the other three
  // harnesses, these files can't live inside the project.
  const promptsDir = path.join(os.homedir(), '.codex', 'prompts');
  const codexSrc = path.join(ROOT, 'commands', 'codex');

  writeFile(path.join(promptsDir, 'bokata-feature-map.md'), fs.readFileSync(path.join(codexSrc, 'feature-map.md'), 'utf8'));
  writeFile(path.join(promptsDir, 'bokata-slice-feature.md'), fs.readFileSync(path.join(codexSrc, 'slice-feature.md'), 'utf8'));

  // The html/story-map templates the commands reference do stay project-scoped,
  // since they're read at runtime by path, not discovered as prompts.
  copyDirRecursive(path.join(ROOT, 'commands', 'task-parallel', 'resources'), path.join(cwd, '.codex', 'resources'));

  console.log('✅ Commands installed for Codex:');
  console.log(`   ⚠ /bokata-feature-map and /bokata-slice-feature written to ${promptsDir}`);
  console.log('     This is global to your user account (shared across all Codex projects),');
  console.log('     not scoped to this repo — Codex does not support project-local prompts.');
  console.log(`   Resource templates copied to .codex/resources/ (this project only)`);
}

function copyDirStripFrontmatterForTopLevelMd(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.name.endsWith('.md')) {
      const content = fs.readFileSync(srcPath, 'utf8');
      writeFile(destPath, stripFrontmatter(content));
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n+/, '');
}

function generateNameDescriptionAgent(name, prompt) {
  return `---
name: ${name}
description: Product Trio member — ${getRoleDescription(name)}. Invoked only by /bokata:feature-map and /bokata:slice-feature orchestrator commands.
---

${prompt}`;
}

function generateOpenCodeAgent(name, prompt) {
  return `---
description: Product Trio member — ${getRoleDescription(name)}. Invoked only by /bokata:feature-map and /bokata:slice-feature orchestrator commands.
mode: subagent
permission:
  edit: deny
---

${prompt}`;
}

function generateCodexAgent(name, prompt) {
  return `name = "${name}"
description = "Product Trio member — ${getRoleDescription(name)}. Invoked only by /bokata:feature-map and /bokata:slice-feature orchestrator commands."
developer_instructions = """
${prompt}
"""
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
`;
}

function getRoleDescription(name) {
  const descriptions = {
    'bokata-product-manager': 'viability/value lens (Teresa Torres). Reviews and contributes to bokata backbone, acceptance criteria, and slicing artifacts for business value, prioritization, ROI, and scope justification',
    'bokata-product-designer': 'usability lens broadened to UX/UI craft (visual design, interaction design, component/UI feasibility, not just journey coherence). Reviews and contributes to bokata backbone, acceptance criteria, and slicing artifacts',
    'bokata-product-engineer': 'feasibility lens broadened to technical sustainability (architecture soundness, maintainability, tech debt, long-term implications of Walking Skeleton/increment choices), not just one-shot buildability. Reviews and contributes to bokata backbone, acceptance criteria, and slicing artifacts'
  };
  return descriptions[name] || 'bokata workflow participant';
}

function printSummary(selected) {
  const activeKeys = HARNESS_KEYS.filter((k) => selected[k]);
  const nonCodexKeys = activeKeys.filter((k) => k !== 'codex');

  console.log('');
  console.log('========================================');
  console.log(`  Bokata installed for ${activeKeys.length} harness(es): ${activeKeys.join(', ')}`);
  console.log('========================================');
  console.log('');
  console.log('Usage:');
  if (nonCodexKeys.length > 0) {
    console.log(`  (${nonCodexKeys.join(', ')})`);
    console.log('  /bokata:feature-map [initiative]  — Generate Features Backbone + Functional ACs');
    console.log('  /bokata:slice-feature [feature]   — Decompose Feature into Walking Skeleton + Increments');
  }
  if (selected.codex) {
    console.log('  (codex)');
    console.log('  /bokata-feature-map [initiative]  — Generate Features Backbone + Functional ACs');
    console.log('  /bokata-slice-feature [feature]   — Decompose Feature into Walking Skeleton + Increments');
  }
  console.log('');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = { runInstall, detectHarnesses, stripFrontmatter };
