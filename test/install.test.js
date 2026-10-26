const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { SKILLS, AGENTS } = require('../src/install');
const { parseAgent } = require('../src/agents');

const BIN = path.join(__dirname, '..', 'bin', 'bokata.js');
const ROOT = path.join(__dirname, '..');

function project(setup = () => {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bokata-'));
  setup(dir);
  return dir;
}

function bokata(cwd, ...args) {
  return execFileSync('node', [BIN, ...args], { cwd, encoding: 'utf8' });
}

function read(dir, ...parts) {
  return fs.readFileSync(path.join(dir, ...parts), 'utf8');
}

test('every listed skill and agent exists in the package', () => {
  for (const skill of SKILLS) {
    assert.ok(fs.existsSync(path.join(ROOT, '.agents', 'skills', skill, 'SKILL.md')), skill);
  }
  for (const agent of AGENTS) {
    const { meta } = parseAgent(read(ROOT, 'agents', `${agent}.md`));
    assert.strictEqual(meta.name, agent);
    assert.ok(['trio', 'executor', 'reviewer'].includes(meta.role), `${agent} role`);
  }
});

test('installs skills once in .agents/skills and links them for Claude Code', () => {
  const dir = project();
  bokata(dir, 'install', '--claude', '--yes');

  for (const skill of SKILLS) {
    assert.ok(fs.existsSync(path.join(dir, '.agents', 'skills', skill, 'SKILL.md')), skill);
    const link = path.join(dir, '.claude', 'skills', skill);
    assert.ok(fs.lstatSync(link).isSymbolicLink(), `${skill} is a symlink`);
    assert.ok(fs.existsSync(path.join(link, 'SKILL.md')), `${skill} link resolves`);
  }
});

test('replaces an old copied skill folder with a link', () => {
  const dir = project((d) => {
    fs.mkdirSync(path.join(d, '.claude', 'skills', 'bokata-feature-slicer'), { recursive: true });
    fs.writeFileSync(path.join(d, '.claude', 'skills', 'bokata-feature-slicer', 'SKILL.md'), 'old');
  });
  bokata(dir, 'install', '--claude', '--yes');

  assert.ok(fs.lstatSync(path.join(dir, '.claude', 'skills', 'bokata-feature-slicer')).isSymbolicLink());
});

test('generates the executor for each harness with the configured code method and model', () => {
  const dir = project((d) => {
    fs.writeFileSync(
      path.join(d, '.bokata.json'),
      JSON.stringify({
        methods: { code: 'my-tdd' },
        models: { opencode: { executor: 'opencode-go/deepseek-v4.1-flash' }, claude: { executor: 'sonnet' } }
      })
    );
  });
  bokata(dir, 'install', '--claude', '--opencode', '--codex', '--cursor', '--yes');

  const claude = read(dir, '.claude', 'agents', 'code-executor.md');
  assert.match(claude, /^model: sonnet$/m);
  assert.match(claude, /^skills:\n {2}- my-tdd$/m);

  const opencode = read(dir, '.opencode', 'agents', 'code-executor.md');
  assert.match(opencode, /^model: opencode-go\/deepseek-v4\.1-flash$/m);
  assert.match(opencode, /^mode: all$/m);
  assert.match(opencode, /"git push\*": deny/);
  assert.match(opencode, /First, load the skill `my-tdd`/);

  const codex = read(dir, '.codex', 'agents', 'code-executor.toml');
  assert.match(codex, /^sandbox_mode = "workspace-write"$/m);

  assert.ok(fs.existsSync(path.join(dir, '.cursor', 'agents', 'code-executor.md')));
  assert.ok(!read(dir, '.claude', 'agents', 'code-executor.md').includes('{{'));
});

test('read-only agents cannot edit', () => {
  const dir = project();
  bokata(dir, 'install', '--claude', '--opencode', '--codex', '--yes');

  assert.match(read(dir, '.claude', 'agents', 'design-reviewer.md'), /^tools: Read, Grep, Glob, Bash$/m);
  assert.match(read(dir, '.opencode', 'agents', 'bokata-product-manager.md'), /^ {2}edit: deny$/m);
  assert.match(read(dir, '.codex', 'agents', 'bokata-product-engineer.toml'), /^sandbox_mode = "read-only"$/m);
  assert.match(read(dir, '.codex', 'agents', 'bokata-product-engineer.toml'), /^model = "gpt-5\.4"$/m);
});

test('writes .bokata.json and keeps the user values on reinstall', () => {
  const dir = project((d) => {
    fs.writeFileSync(path.join(d, '.bokata.json'), JSON.stringify({ docs: 'work', harnesses: ['codex'] }));
  });
  bokata(dir, 'install', '--claude', '--yes');

  const config = JSON.parse(read(dir, '.bokata.json'));
  assert.strictEqual(config.docs, 'work');
  assert.deepStrictEqual(config.harnesses, ['codex', 'claude']);
  assert.strictEqual(config.methods.code, 'bokata-tdd');
});

test('sync regenerates agents from .bokata.json without flags', () => {
  const dir = project();
  bokata(dir, 'install', '--opencode', '--yes');

  const configPath = path.join(dir, '.bokata.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.models.opencode = { reviewer: 'opencode-go/glm-5.3-flash' };
  fs.writeFileSync(configPath, JSON.stringify(config));
  bokata(dir, 'sync');

  assert.match(read(dir, '.opencode', 'agents', 'design-reviewer.md'), /^model: opencode-go\/glm-5\.3-flash$/m);
});

test('removes what bokata 2.x installed', () => {
  const dir = project((d) => {
    for (const parts of [
      ['.claude', 'commands', 'bokata'],
      ['.opencode', 'command', 'bokata'],
      ['.opencode', 'skills', 'bokata-feature-mapper'],
      ['.codex', 'resources']
    ]) {
      fs.mkdirSync(path.join(d, ...parts), { recursive: true });
    }
    fs.writeFileSync(path.join(d, '.codex', 'resources', 'html-template.md'), 'x');
    fs.mkdirSync(path.join(d, '.opencode', 'skills', 'my-own-skill'), { recursive: true });
  });
  bokata(dir, 'install', '--claude', '--opencode', '--yes');

  assert.ok(!fs.existsSync(path.join(dir, '.claude', 'commands', 'bokata')));
  assert.ok(!fs.existsSync(path.join(dir, '.opencode', 'command', 'bokata')));
  assert.ok(!fs.existsSync(path.join(dir, '.opencode', 'skills', 'bokata-feature-mapper')));
  assert.ok(!fs.existsSync(path.join(dir, '.codex', 'resources')));
  assert.ok(fs.existsSync(path.join(dir, '.opencode', 'skills', 'my-own-skill')), 'keeps non-bokata skills');
});

test('sync without .bokata.json fails with a hint', () => {
  const dir = project();
  assert.throws(() => execFileSync('node', [BIN, 'sync'], { cwd: dir, stdio: 'pipe' }), /install/);
});
