#!/usr/bin/env node
// src/kiro/build.mjs — Build the Kiro distribution from src/.
//
// Output: dist/kiro/.kiro/  (works for both Kiro IDE and Kiro CLI)
//
// Sources:
//   src/kiro/agents/           → dist/kiro/.kiro/agents/
//   src/kiro/aidlc-common/     → dist/kiro/.kiro/aidlc-common/
//   src/skills/                → dist/kiro/.kiro/skills/
//   src/kiro/hooks/            → dist/kiro/.kiro/hooks/
//
// Source content uses repo-anchored paths (e.g. `aidlc-common/protocols/...`).
// When materialised under .kiro/, those paths resolve correctly because the
// install root for Kiro IS .kiro/.
//
// Pure Node.js so the build runs identically on macOS, Linux, and Windows
// without a POSIX shell.

import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, '..', '..');
const SRC = join(ROOT, 'src');
const KIRO_SRC = join(SRC, 'kiro');
const OUT = join(ROOT, 'dist', 'kiro', '.kiro');

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

// Recursively collect files under `dir` whose basename matches `predicate`.
function findFiles(dir, predicate) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findFiles(full, predicate));
    } else if (entry.isFile() && predicate(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

console.log('Building dist/kiro/ ...');

// Wipe and recreate the output directory.
rmSync(join(ROOT, 'dist', 'kiro'), { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// 1. Copy kiro-specific agents and aidlc-common.
cpSync(join(KIRO_SRC, 'agents'), join(OUT, 'agents'), { recursive: true });
cpSync(join(KIRO_SRC, 'aidlc-common'), join(OUT, 'aidlc-common'), { recursive: true });

// 2. Copy shared skills.
cpSync(join(SRC, 'skills'), join(OUT, 'skills'), { recursive: true });

// 3. Copy Kiro-specific hooks.
cpSync(join(KIRO_SRC, 'hooks'), join(OUT, 'hooks'), { recursive: true });

// 4. Validate the output.
console.log('Validating ...');

// 4a. Every JSON file must parse.
for (const jsonFile of findFiles(OUT, (name) => name.endsWith('.json'))) {
  try {
    JSON.parse(readFileSync(jsonFile, 'utf8'));
  } catch {
    fail(`  FAIL: invalid JSON: ${jsonFile}`);
  }
}

// 4b. Every SKILL.md must have frontmatter with name. Skills that appear in
// workflow.md (everything except aidlc-orchestrator) must additionally have
// phase and stage. The orchestrator skill is a meta-skill — it dispatches to
// others and never appears in workflow.md.
let missing = 0;
for (const skill of findFiles(join(OUT, 'skills'), (name) => name === 'SKILL.md')) {
  const isOrchestrator = skill.replaceAll('\\', '/').endsWith('/aidlc-orchestrator/SKILL.md');
  const fields = isOrchestrator ? ['name'] : ['name', 'phase', 'stage'];
  const content = readFileSync(skill, 'utf8');
  for (const field of fields) {
    if (!new RegExp(`^\\s*${field}:`, 'm').test(content)) {
      console.error(`  FAIL: ${skill} missing frontmatter field '${field}'`);
      missing += 1;
    }
  }
}
if (missing !== 0) process.exit(1);

// 4c. The process-checker script must syntax-check.
execFileSync(
  process.execPath,
  ['--check', join(OUT, 'aidlc-common', 'scripts', 'aidlc-process-checker.js')],
  { stdio: 'inherit' },
);

console.log('  → dist/kiro/.kiro/  (use for both Kiro IDE and Kiro CLI)');
