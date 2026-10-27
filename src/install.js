const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { readConfig, writeConfig, CONFIG_FILE } = require('./config');
const { resolveAgent, RENDERERS } = require('./agents');

const ROOT = path.join(__dirname, '..');

const SKILLS = [
  'bokata-shape',
  'bokata-feature-map',
  'bokata-slice',
  'bokata-plan',
  'bokata-tdd',
  'bokata-refactor',
  'bokata-status',
  'bokata-feature-mapper',
  'bokata-feature-slicer',
  'bokata-acceptance-criteria'
];

const AGENTS = [
  'bokata-product-manager',
  'bokata-product-designer',
  'bokata-product-engineer',
  'code-executor',
  'design-reviewer'
];

const ROLES = ['trio', 'executor', 'reviewer'];

const HARNESS_KEYS = ['claude', 'cursor', 'opencode', 'codex'];

// Every harness reads skills from .agents/skills except these, which get symlinks to it.
const SKILL_LINK_DIRS = {
  claude: ['.claude', 'skills'],
  cursor: ['.cursor', 'skills']
};

// What bokata 2.x installed and v3 replaces.
const LEGACY_DIRS = [
  ['.claude', 'commands', 'bokata'],
  ['.cursor', 'commands', 'bokata'],
  ['.opencode', 'command', 'bokata'],
  ['.opencode', 'commands', 'bokata']
];
// 2.x copied its HTML templates here; only remove the folder if that is what it holds.
const LEGACY_CODEX_RESOURCES = ['.codex', 'resources'];
const LEGACY_SKILL_PARENTS = [['.opencode', 'skills'], ['.codex', 'skills']];

async function runInstall(args) {
  const cwd = process.cwd();
  const flags = parseFlags(args);
  const { config } = readConfig(cwd);
  const selected = await resolveHarnesses(flags, detectHarnesses(cwd));

  const activeKeys = HARNESS_KEYS.filter((k) => selected[k]);
  if (activeKeys.length === 0) {
    console.log('Nothing to install — no harness selected.');
    return;
  }

  config.harnesses = unique([...config.harnesses, ...activeKeys]);
  if (!flags.yes) await askModels(config, activeKeys);
  writeConfig(cwd, config);
  console.log(`✅ ${CONFIG_FILE} written (edit it, then run "npx bokata sync")`);

  apply(cwd, config, activeKeys);
}

async function runSync() {
  const cwd = process.cwd();
  const { exists, config } = readConfig(cwd);
  if (!exists) {
    throw new Error(`no ${CONFIG_FILE} here — run "npx bokata install" first`);
  }
  const activeKeys = HARNESS_KEYS.filter((k) => config.harnesses.includes(k));
  if (activeKeys.length === 0) {
    throw new Error(`${CONFIG_FILE} lists no harnesses`);
  }
  apply(cwd, config, activeKeys);
}

function apply(cwd, config, activeKeys) {
  removeLegacy(cwd);
  installSkills(cwd, activeKeys);
  installAgents(cwd, config, activeKeys);
  printSummary(config, activeKeys);
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
    opencode: fs.existsSync(path.join(cwd, '.opencode')) || fs.existsSync(path.join(cwd, 'opencode.json')),
    codex: fs.existsSync(path.join(cwd, '.codex'))
  };
}

async function resolveHarnesses(flags, detected) {
  const explicit = HARNESS_KEYS.some((k) => flags[k]);
  if (explicit) {
    return Object.fromEntries(HARNESS_KEYS.map((k) => [k, flags[k]]));
  }
  if (HARNESS_KEYS.some((k) => detected[k])) return detected;
  if (flags.yes) return Object.fromEntries(HARNESS_KEYS.map((k) => [k, false]));
  return promptForHarnesses();
}

async function promptForHarnesses() {
  return withPrompt(async (ask) => {
    console.log('No .claude/, .cursor/, .opencode/ or .codex/ found in this directory.');
    console.log('Which harness(es) do you want to install Bokata for? (y/n each)\n');
    const selected = {};
    for (const key of HARNESS_KEYS) {
      const answer = (await ask(`  ${key}? [y/N] `)).toLowerCase();
      selected[key] = answer === 'y' || answer === 'yes';
    }
    return selected;
  });
}

async function askModels(config, activeKeys) {
  await withPrompt(async (ask) => {
    console.log('\nModel per role (blank keeps the current value; "-" = harness default).');
    for (const harness of activeKeys) {
      config.models[harness] = config.models[harness] || {};
      for (const role of ROLES) {
        const current = config.models[harness][role];
        const answer = await ask(`  ${harness} · ${role}${current ? ` [${current}]` : ''}: `);
        if (answer === '-') config.models[harness][role] = null;
        else if (answer) config.models[harness][role] = answer;
      }
    }
  });
}

async function withPrompt(fn) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (question) => new Promise((resolve) => rl.question(question, (a) => resolve(a.trim())));
  try {
    return await fn(ask);
  } finally {
    rl.close();
  }
}

function removeLegacy(cwd) {
  const removed = [];
  for (const parts of LEGACY_DIRS) {
    const dir = path.join(cwd, ...parts);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      removed.push(parts.join('/'));
    }
  }
  const codexResources = path.join(cwd, ...LEGACY_CODEX_RESOURCES);
  if (fs.existsSync(path.join(codexResources, 'html-template.md'))) {
    fs.rmSync(codexResources, { recursive: true, force: true });
    removed.push(LEGACY_CODEX_RESOURCES.join('/'));
  }
  for (const parts of LEGACY_SKILL_PARENTS) {
    for (const skill of SKILLS) {
      const dir = path.join(cwd, ...parts, skill);
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        removed.push([...parts, skill].join('/'));
      }
    }
  }
  if (removed.length > 0) console.log(`🧹 Removed bokata 2.x files: ${removed.join(', ')}`);
}

function installSkills(cwd, activeKeys) {
  for (const skill of SKILLS) {
    const dest = path.join(cwd, '.agents', 'skills', skill);
    fs.rmSync(dest, { recursive: true, force: true });
    copyDirRecursive(path.join(ROOT, '.agents', 'skills', skill), dest);
  }
  console.log(`✅ ${SKILLS.length} skills in .agents/skills/`);

  for (const key of activeKeys) {
    const parts = SKILL_LINK_DIRS[key];
    if (!parts) continue;
    for (const skill of SKILLS) linkSkill(cwd, parts, skill);
    console.log(`✅ Skills linked from ${parts.join('/')}/`);
  }
}

function linkSkill(cwd, parts, skill) {
  const linkPath = path.join(cwd, ...parts, skill);
  const target = path.relative(path.dirname(linkPath), path.join(cwd, '.agents', 'skills', skill));
  ensureDir(path.dirname(linkPath));
  fs.rmSync(linkPath, { recursive: true, force: true });
  try {
    fs.symlinkSync(target, linkPath, 'dir');
  } catch {
    // Symlinks can be unavailable (e.g. Windows without developer mode): copy instead.
    copyDirRecursive(path.join(cwd, '.agents', 'skills', skill), linkPath);
  }
}

function installAgents(cwd, config, activeKeys) {
  for (const key of activeKeys) {
    const { dir, ext, render } = RENDERERS[key];
    for (const agent of AGENTS) {
      const source = fs.readFileSync(path.join(ROOT, 'agents', `${agent}.md`), 'utf8');
      writeFile(path.join(cwd, ...dir, `${agent}${ext}`), render(resolveAgent(source, config), config));
    }
    console.log(`✅ ${AGENTS.length} agents in ${dir.join('/')}/`);
  }
}

function printSummary(config, activeKeys) {
  console.log('');
  console.log('========================================');
  console.log(`  Bokata installed for: ${activeKeys.join(', ')}`);
  console.log('========================================');
  console.log('');
  console.log('Skills (invoke them by name in any harness):');
  console.log('  bokata-shape         grill + shape an idea into a pitch');
  console.log('  bokata-feature-map   features + functional ACs (large initiatives)');
  console.log('  bokata-slice         cut a vertical slice from 1-3 features');
  console.log('  bokata-plan          write the plan into the slice, inside your plan mode');
  console.log('  bokata-status        where an initiative stands');
  console.log('');
  console.log('Methods (.bokata.json → methods; name another skill to swap one):');
  for (const [slot, skill] of Object.entries(config.methods)) {
    console.log(`  ${slot.padEnd(9)} ${skill || '(none)'}`);
  }
  console.log('');
  const skillDirs = [['.agents', 'skills'], ['.claude', 'skills'], ['.opencode', 'skills']];
  for (const [slot, skill] of Object.entries(config.methods)) {
    if (!skill) continue;
    const found = skillDirs.some((parts) => fs.existsSync(path.join(process.cwd(), ...parts, skill)));
    if (!found) {
      console.log(`⚠ methods.${slot} is "${skill}" but no skill with that name is installed.`);
      console.log(`  Install it (e.g. from mattpocock/skills) or change methods.${slot} in .bokata.json.`);
    }
  }
}

function unique(items) {
  return [...new Set(items)];
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

module.exports = { runInstall, runSync, detectHarnesses, SKILLS, AGENTS };
