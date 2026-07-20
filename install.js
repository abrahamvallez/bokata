#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Detectar harness presentes
const harnesses = {
  claude: fs.existsSync('.claude'),
  opencode: fs.existsSync('.opencode'),
  cursor: fs.existsSync('.cursor'),
  codex: fs.existsSync('.codex')
};

const skills = [
  'bokata-feature-mapper',
  'bokata-feature-slicer',
  'bokata-acceptance-criteria'
];

const agents = [
  'bokata-product-manager',
  'bokata-product-designer',
  'bokata-product-engineer'
];

// Coordinator: only for task-parallel harnesses (Claude, Cursor, OpenCode)
// In Codex, the coordinator runs in the main thread — no separate agent needed.
const coordinator = 'bokata-product-coordinator';

let installed = 0;

// 1. Skills: symlink universal (todos leen .agents/skills/)
for (const [harness, exists] of Object.entries(harnesses)) {
  if (exists) {
    skills.forEach(skill => {
      const target = `.${harness}/skills/${skill}`;
      const source = `../../.agents/skills/${skill}`;
      createSymlink(source, target);
    });
    console.log(`✅ Skills linked to .${harness}/skills/`);
    installed++;
  }
}

// 2. Agents: copiar con frontmatter específico
if (harnesses.claude || harnesses.cursor) {
  agents.forEach(agent => {
    const prompt = fs.readFileSync(`agents/${agent}.md`, 'utf8');
    const output = generateTaskParallelAgent(agent, prompt);
    if (harnesses.claude) {
      ensureDir('.claude/agents');
      fs.writeFileSync(`.claude/agents/${agent}.md`, output);
    }
    if (harnesses.cursor) {
      ensureDir('.cursor/agents');
      fs.writeFileSync(`.cursor/agents/${agent}.md`, output);
    }
  });
  // Coordinator: neutral orchestrator for task-parallel harnesses
  const coordPrompt = fs.readFileSync(`agents/${coordinator}.md`, 'utf8');
  const coordOutput = generateTaskParallelAgent(coordinator, coordPrompt);
  if (harnesses.claude) {
    ensureDir('.claude/agents');
    fs.writeFileSync(`.claude/agents/${coordinator}.md`, coordOutput);
  }
  if (harnesses.cursor) {
    ensureDir('.cursor/agents');
    fs.writeFileSync(`.cursor/agents/${coordinator}.md`, coordOutput);
  }
  if (harnesses.claude) console.log('✅ Agents installed for Claude Code');
  if (harnesses.cursor) console.log('✅ Agents installed for Cursor');
  installed++;
}

if (harnesses.opencode) {
  agents.forEach(agent => {
    const prompt = fs.readFileSync(`agents/${agent}.md`, 'utf8');
    const output = generateOpenCodeAgent(agent, prompt);
    ensureDir('.opencode/agents');
    fs.writeFileSync(`.opencode/agents/${agent}.md`, output);
  });
  // Coordinator: neutral orchestrator for OpenCode
  const coordPrompt = fs.readFileSync(`agents/${coordinator}.md`, 'utf8');
  const coordOutput = generateOpenCodeAgent(coordinator, coordPrompt);
  ensureDir('.opencode/agents');
  fs.writeFileSync(`.opencode/agents/${coordinator}.md`, coordOutput);
  console.log('✅ Agents installed for OpenCode');
  installed++;
}

if (harnesses.codex) {
  agents.forEach(agent => {
    const prompt = fs.readFileSync(`agents/${agent}.md`, 'utf8');
    const output = generateCodexAgent(agent, prompt);
    ensureDir('.codex/agents');
    fs.writeFileSync(`.codex/agents/${agent}.toml`, output);
  });
  console.log('✅ Agents installed for Codex (TOML)');
  installed++;
}

// 3. Commands: copiar según modelo de ejecución
if (harnesses.claude || harnesses.cursor) {
  copyDir('commands/task-parallel', '.claude/commands/bokata');
  copyDir('commands/task-parallel', '.cursor/commands/bokata');
  if (harnesses.claude) console.log('✅ Commands installed for Claude Code (task-parallel)');
  if (harnesses.cursor) console.log('✅ Commands installed for Cursor (task-parallel)');
  installed++;
}

if (harnesses.opencode) {
  copyDir('commands/task-parallel', '.opencode/commands/bokata');
  console.log('✅ Commands installed for OpenCode (task-parallel)');
  installed++;
}

if (harnesses.codex) {
  copyDir('commands/codex', '.codex/commands/bokata');
  console.log('✅ Commands installed for Codex');
  installed++;
}

// Summary
console.log('');
console.log('========================================');
console.log(`  Bokata installed for ${installed} harness(es)`);
console.log('========================================');
console.log('');
console.log('Usage:');
console.log('  /bokata:feature-map [initiative]  — Generate Features Backbone + Functional ACs');
console.log('  /bokata:slice-feature [feature]   — Decompose Feature into Walking Skeleton + Increments');
console.log('');

// Helper functions
function createSymlink(source, target) {
  if (!fs.existsSync(path.dirname(target))) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
  }
  if (!fs.existsSync(target)) {
    fs.symlinkSync(source, target);
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateTaskParallelAgent(name, prompt) {
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
    'bokata-product-coordinator': 'neutral orchestrator — invokes skills, launches trio reviewers, reconciles findings into buckets (non-conflicting, factual, trade-off), escalates trade-offs to the human',
    'bokata-product-manager': 'viability/value lens (Teresa Torres). Reviews and contributes to bokata backbone, acceptance criteria, and slicing artifacts for business value, prioritization, ROI, and scope justification',
    'bokata-product-designer': 'usability lens broadened to UX/UI craft (visual design, interaction design, component/UI feasibility, not just journey coherence). Reviews and contributes to bokata backbone, acceptance criteria, and slicing artifacts',
    'bokata-product-engineer': 'feasibility lens broadened to technical sustainability (architecture soundness, maintainability, tech debt, long-term implications of Walking Skeleton/increment choices), not just one-shot buildability. Reviews and contributes to bokata backbone, acceptance criteria, and slicing artifacts'
  };
  return descriptions[name] || 'bokata workflow participant';
}
