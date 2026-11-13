const fs = require('fs');
const path = require('path');

const CONFIG_FILE = '.bokata.json';

const DEFAULTS = {
  docs: 'docs/initiatives',
  language: 'auto',
  story_map: true,
  memory: {
    constitution: 'CONSTITUTION.md',
    glossary: 'GLOSSARY.md',
    standards: 'CODING_STANDARDS.md',
    adrs: 'docs/adrs',
    adr_template: null
  },
  templates: { pitch: null, features: null, slice: null },
  // Method slots: each names the skill that does that job. Swap one by naming another skill.
  methods: {
    grill: 'grill-with-docs',
    domain: 'domain-modeling',
    code: 'bokata-tdd',
    refactor: 'bokata-refactor'
  },
  harnesses: [],
  // Model per harness and role. trio and reviewer analyse and plan; executor writes code.
  // A role set to null (or missing) uses the harness's own default model.
  models: {
    claude: { trio: 'opus', reviewer: 'opus', executor: 'sonnet', render: 'haiku' },
    opencode: {
      trio: 'opencode-go/glm-5.3-flash',
      reviewer: 'opencode-go/glm-5.3-flash',
      executor: 'opencode-go/deepseek-v4.1-flash',
      render: 'opencode-go/glm-5.3-flash'
    },
    cursor: { trio: 'glm-flash', reviewer: 'glm-flash', executor: 'sonnet', render: 'glm-flash' },
    codex: { trio: 'gpt-5.6-sol', reviewer: 'gpt-5.6-sol', executor: 'gpt-5.6-luna', render: 'gpt-5.6-luna' }
  }
};

function configPath(cwd) {
  return path.join(cwd, CONFIG_FILE);
}

function readConfig(cwd) {
  const file = configPath(cwd);
  if (!fs.existsSync(file)) return { exists: false, config: clone(DEFAULTS) };
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { exists: true, config: merge(clone(DEFAULTS), raw) };
}

function writeConfig(cwd, config) {
  fs.writeFileSync(configPath(cwd), JSON.stringify(config, null, 2) + '\n');
}

function merge(base, override) {
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(base[key])) {
      base[key] = merge(base[key], value);
    } else {
      base[key] = value;
    }
  }
  return base;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = { CONFIG_FILE, DEFAULTS, readConfig, writeConfig, merge };
