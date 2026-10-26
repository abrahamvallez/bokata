const fs = require('fs');
const path = require('path');

const CONFIG_FILE = '.bokata.json';

const DEFAULTS = {
  docs: 'docs/initiatives',
  language: 'auto',
  html: true,
  story_map: true,
  memory: {
    constitution: 'CONSTITUTION.md',
    glossary: 'CONTEXT.md',
    standards: 'CODING_STANDARDS.md',
    adrs: 'docs/adrs',
    adr_template: null
  },
  templates: { pitch: null, features: null, slice: null },
  methods: { grill: 'grill-with-docs', code: 'bokata-tdd' },
  harnesses: [],
  // Model per harness and role (trio | executor | reviewer). Missing = the harness default.
  models: {
    codex: { trio: 'gpt-5.4' }
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
