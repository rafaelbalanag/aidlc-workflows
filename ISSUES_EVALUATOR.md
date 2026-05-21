# Open Issues — Evaluator

Issues specific to `scripts/aidlc-evaluator` discovered during v2 integration testing.

---

## EVAL-001: process_checker not running — protocol violations not caught

**Status:** Open
**Area:** `scripts/aidlc-evaluator/packages/execution/src/aidlc_runner/runner.py`
**Found during:** sci-calc evaluator runs (2026-05-19)

### Description

The evaluator orchestrator prompt falls back to manual state machine enforcement when `process_checker.js` cannot run. This means protocol violations (missing audit entries, wrong state transitions, missing artifacts) are never caught and the workflow proceeds silently regardless.

In the Kiro environment `process_checker` is enforced via a hook after every sub-agent call. The evaluator has no equivalent mechanism.

### Expected behaviour

After each builder/validator handoff returns, the evaluator should invoke `process_checker.js`. If Node.js is not available, the run should surface a warning (or halt) rather than continuing unchecked.

### Options

1. Add Node.js to the evaluator sandbox/dependencies and wire `process_checker` calls into `runner.py` after each Strands handoff completes.
2. Port the `process_checker` logic to Python inside the evaluator so it runs without Node.js.

---

## EVAL-002: Orchestrator was doing builder's work (prompt issue)

**Status:** Fixed (2026-05-19)
**Area:** `scripts/aidlc-evaluator/packages/execution/src/aidlc_runner/agents/orchestrator.py`
**Found during:** sci-calc evaluator run 1 (2026-05-19)

### Description

The orchestrator wrote skill artifacts directly (requirements, designs, code) instead of handing off to the builder. Root cause: the Strands `handoff_to_agent` tool returns a result and does not interrupt the agent's turn — the orchestrator would call handoff then continue using `write_file` and `run_command` in the same turn.

### Fix applied

1. Removed `write_file` and `run_command` from the orchestrator's toolset entirely (`make_readonly_file_tools`). Structural prevention is more reliable than prompt-only constraints.
2. Added explicit `ABSOLUTE PROHIBITION` section in the orchestrator system prompt.

---

## EVAL-003: Builder chaining multiple steps per invocation (prompt issue)

**Status:** Fixed (2026-05-19)
**Area:** `scripts/aidlc-evaluator/packages/execution/src/aidlc_runner/agents/builder.py`
**Found during:** sci-calc evaluator run 2 (2026-05-19)

### Description

Nothing in the builder's system prompt prevented it from running clarification → planning → execution in a single invocation instead of returning to the orchestrator after each step.

### Fix applied

Added `ABSOLUTE PROHIBITION` section and single-step constraint to builder system prompt.

---

## EVAL-004: Simulator instructing orchestrator to advance (prompt issue)

**Status:** Fixed (2026-05-19)
**Area:** `scripts/aidlc-evaluator/packages/execution/src/aidlc_runner/agents/simulator.py`
**Found during:** sci-calc evaluator run 2 (2026-05-19)

### Description

The simulator prompt said "tell it to continue to the next stage" when handing back, which invited the simulator to attempt to drive workflow progression rather than simply reporting what it did.

### Fix applied

Changed handoff instruction to "brief summary only — do not tell the orchestrator what to do next."

---

## EVAL-006: Qualitative scorer gets 0.0 against v1 golden — path structure mismatch

**Status:** Fixed (2026-05-19)
**Area:** `scripts/aidlc-evaluator/packages/qualitative/src/qualitative/document.py`, `test_cases/sci-calc/golden-aidlc-docs/`
**Found during:** sci-calc full evaluation report (2026-05-19)

### Description

The qualitative scorer matches candidate docs to golden docs by relative file path. The v1 golden layout uses `inception/requirements/requirements.md`; the v2 candidate uses `intent-001-scientific-calculator-api/inception/requirements-analysis/requirements.md`. Zero paths match, so the score is 0.0.

### Fix applied

1. **Golden docs reorganized** — `test_cases/sci-calc/golden-aidlc-docs/` restructured from v1 flat layout into the v2 `intent-001-scientific-calculator-api/` hierarchy. Old v1 dirs (`inception/`, `construction/`) removed.
2. **`document.py` updated** — `pair_documents()` now strips the `intent-NNN-<slug>/` prefix from both reference and candidate paths before matching, so runs with different intent slugs still pair correctly. `classify_phase()` updated to handle the v2 prefix. `_SKIP_FILES` extended to include v2 state/audit filenames.

---

## EVAL-007: Contract tests fail in --evaluate-only mode — missing .venv

**Status:** Fixed (2026-05-19)
**Area:** `scripts/aidlc-evaluator/packages/contracttest/src/contracttest/server.py`
**Found during:** sci-calc full evaluation report (2026-05-19)

### Description

When `--evaluate-only` is used against an existing run folder, the workspace `.venv` may have been removed. The contract test runner was using `uv venv` + `uv pip install` (two steps) to recreate it, which failed silently when no lockfile was present, leaving `.venv` incomplete. The server then crashed with `FileNotFoundError: .venv/bin/python`.

### Fix applied

Replaced the two-step `uv venv` + `uv pip install -e .[dev]` with a single `uv sync --all-extras`, matching the strategy used by `post_run.py`. `uv sync` creates the venv and installs from the lockfile in one reliable step.

---

## EVAL-009: Validator agent never called in practice

**Status:** Fixed (2026-05-21)
**Area:** `scripts/aidlc-evaluator/packages/execution/src/aidlc_runner/agents/orchestrator.py`
**Found during:** sci-calc-v2 runs (2026-05-20)

### Description

Across all successful runs, the validator agent was never invoked. The orchestrator was reading builder artifacts and deciding they "looked correct" without an explicit prohibition against skipping validation.

### Fix applied

Added a `MANDATORY VALIDATION RULE` section to the orchestrator system prompt with an explicit sequence diagram (`builder (execution) → validator → next step`), a list of prohibited skip behaviours, and the clarification that validation is only required after execution steps (not clarification or planning).

---

## EVAL-008: High repeated context tokens with multi-agent swarm (27 handoffs → 42.7M tokens)

**Status:** Open — monitoring
**Area:** Strands swarm architecture / `scripts/aidlc-evaluator/packages/execution/`
**Found during:** sci-calc full evaluation report (2026-05-19)

### Description

With 27 handoffs, the Strands swarm re-sends the full conversation history to each agent on every turn. Unique tokens were 6.8M but API total was 49.5M — a 7.2x multiplier. The v1 two-agent run had 3 handoffs and 0 repeated context tokens.

This is expected Strands behavior but will compound significantly on longer workflows (all-stages test case).

### Options

1. Investigate Strands context pruning / summarization between handoffs.
2. Accept as a known cost of the multi-agent architecture and track in baselines.

---

## EVAL-010: Kiro adapter doesn't find aidlc-docs under org-ai-kb/

**Status:** Fixed (2026-05-21)
**Area:** `scripts/aidlc-evaluator/packages/cli-harness/src/cli_harness/adapters/kiro_cli.py`
**Found during:** first kiro v2 run (2026-05-21)

### Description

The v2 folder structure places aidlc-docs at `org-ai-kb/aidlc-docs/` inside the workspace. The kiro adapter's move step and completion check only looked for `workspace/aidlc-docs/`, missing the `org-ai-kb/` prefix.

### Fix applied

Added `_find_aidlc_docs(workspace)` helper that checks `workspace/aidlc-docs/` first, then searches one level deep for `<subdir>/aidlc-docs/`. Both the completion check and the move step now use this helper.

---

## EVAL-011: Construction unit name nondeterminism breaks qualitative matching

**Status:** Fixed (2026-05-21)
**Area:** `scripts/aidlc-evaluator/packages/qualitative/src/qualitative/document.py`
**Found during:** first kiro v2 run (2026-05-21)

### Description

The kiro run named its construction unit `scientific-calculator-api` while the golden uses `sci-calc`. Since `pair_documents()` matched by path after stripping only the intent prefix, `construction/scientific-calculator-api/code-generation/` never matched `construction/sci-calc/code-generation/`, scoring all construction docs as 0.

### Fix applied

Added `_CONSTRUCTION_UNIT` regex to `document.py` that normalises `construction/<any-unit-name>/` to `construction/_unit_/` before matching. The `_normalise_path()` function applies both the intent prefix strip and this unit name normalisation. `_strip_intent_prefix()` is kept as an alias for backward compatibility.

---

## EVAL-005: Audit write responsibility missing from builder/validator prompts (workaround)

**Status:** Workaround applied (2026-05-19) — root fix belongs in `src/` (see ISSUES.md ISSUE-001)
**Area:** `scripts/aidlc-evaluator/packages/execution/src/aidlc_runner/agents/builder.py`, `validator.py`
**Found during:** sci-calc evaluator run 3 (2026-05-19)

### Description

Builder and validator agents were not writing audit entries to `intent-audit.md` because the `aidlc-builder-protocol.md` and `aidlc-validator-protocol.md` source files contain no audit-write instructions. The audit log had only the single entry from intent-bootstrap regardless of how many skills ran.

### Workaround applied

Explicit audit-write instructions added to the builder and validator system prompts in the evaluator. The proper fix is adding an audit responsibilities section to the protocols in `src/` — see ISSUES.md ISSUE-001.
