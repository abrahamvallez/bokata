// Turns a neutral agent file (agents/*.md) into each harness's agent format.
//
// Neutral frontmatter keys:
//   name, description
//   role    trio | executor | reviewer   → picks the model from config.models[harness][role]
//   mode    subagent | all               → opencode mode (all = usable as primary and subagent)
//   access  read | write
//   skills  JSON array
// Anywhere in the file, "{{methods.<slot>}}" is replaced with config.methods.<slot>.

const READ_TOOLS = 'Read, Grep, Glob, Bash';
const FORBIDDEN_GIT = ['git push*', 'git merge*', 'git rebase*', 'git stash*', 'git commit --amend*'];

function parseAgent(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n+/);
  if (!match) throw new Error('agent file has no frontmatter');
  const meta = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    meta[key] = key === 'skills' ? JSON.parse(value) : value;
  }
  return { meta, body: source.slice(match[0].length) };
}

function resolveAgent(source, config) {
  const filled = source.replace(/\{\{methods\.(\w+)\}\}/g, (_, slot) => {
    const skill = config.methods[slot];
    if (!skill) throw new Error(`methods.${slot} is not set in .bokata.json`);
    return skill;
  });
  return parseAgent(filled);
}

function modelFor(config, harness, role) {
  const models = (config.models && config.models[harness]) || {};
  return models[role] || null;
}

function renderClaude({ meta, body }, config) {
  const lines = ['---', `name: ${meta.name}`, `description: ${JSON.stringify(meta.description)}`];
  const model = modelFor(config, 'claude', meta.role);
  if (model) lines.push(`model: ${model}`);
  if (meta.access === 'read') lines.push(`tools: ${READ_TOOLS}`);
  if (meta.skills.length > 0) {
    lines.push('skills:');
    for (const skill of meta.skills) lines.push(`  - ${skill}`);
  }
  lines.push('---', '');
  return lines.join('\n') + body;
}

function renderCursor({ meta, body }, config) {
  const lines = ['---', `name: ${meta.name}`, `description: ${JSON.stringify(meta.description)}`];
  const model = modelFor(config, 'cursor', meta.role);
  if (model) lines.push(`model: ${model}`);
  if (meta.access === 'read') lines.push('readonly: true');
  lines.push('---', '');
  return lines.join('\n') + loadSkillsPreamble(meta) + body;
}

function renderOpenCode({ meta, body }, config) {
  const lines = ['---', `description: ${JSON.stringify(meta.description)}`, `mode: ${meta.mode || 'subagent'}`];
  const model = modelFor(config, 'opencode', meta.role);
  if (model) lines.push(`model: ${model}`);
  lines.push('permission:');
  if (meta.access === 'read') {
    lines.push('  edit: deny');
  } else {
    lines.push('  bash:');
    for (const pattern of FORBIDDEN_GIT) lines.push(`    "${pattern}": deny`);
    lines.push('    "*": allow');
  }
  lines.push('---', '');
  return lines.join('\n') + loadSkillsPreamble(meta) + body;
}

function renderCodex({ meta, body }, config) {
  const model = modelFor(config, 'codex', meta.role);
  const lines = [
    `name = "${meta.name}"`,
    `description = ${JSON.stringify(meta.description)}`,
    `developer_instructions = ${tomlMultiline(loadSkillsPreamble(meta) + body)}`
  ];
  if (model) {
    lines.push(`model = "${model}"`);
    lines.push('model_reasoning_effort = "high"');
  }
  lines.push(`sandbox_mode = "${meta.access === 'read' ? 'read-only' : 'workspace-write'}"`);
  return lines.join('\n') + '\n';
}

// Literal multi-line strings keep backslashes as written; fall back to an escaped basic string.
function tomlMultiline(text) {
  if (!text.includes("'''")) return `'''\n${text}'''`;
  return `"""\n${text.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')}"""`;
}

// Harnesses without skill preloading are told to load the skills first.
function loadSkillsPreamble(meta) {
  if (meta.skills.length === 0) return '';
  const names = meta.skills.map((s) => `\`${s}\``).join(', ');
  return `First, load the skill ${names} with your skill tool and follow it.\n\n`;
}

const RENDERERS = {
  claude: { dir: ['.claude', 'agents'], ext: '.md', render: renderClaude },
  cursor: { dir: ['.cursor', 'agents'], ext: '.md', render: renderCursor },
  opencode: { dir: ['.opencode', 'agents'], ext: '.md', render: renderOpenCode },
  codex: { dir: ['.codex', 'agents'], ext: '.toml', render: renderCodex }
};

module.exports = { parseAgent, resolveAgent, modelFor, RENDERERS };
