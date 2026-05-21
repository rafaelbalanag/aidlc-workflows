# Workflow Rationale

## Classification

Greenfield single-component utility — matches Example B from composition rules.

## Inception Phase

- **requirements-analysis** — INCLUDED. Captures the full operation set, input/output schemas, error semantics, and precision guarantees. Always-on skill.
- **reverse-engineering** — SKIPPED. Greenfield; no existing codebase or integration targets.
- **user-stories** — SKIPPED. Single actor (API client), single happy-path pattern repeated across operations. Requirements doc captures everything needed.
- **wireframes** — SKIPPED. No UI; pure API.
- **application-design** — SKIPPED. Single component (one FastAPI service). No multi-component orchestration or boundary decisions.
- **units-generation** — SKIPPED. Single unit ("sci-calc") is trivially determined from the intent scope.

## Construction Phase

- **code-generation (--unit sci-calc)** — INCLUDED. Generates the implementation, tests, and project configuration. Always-on skill.
- **functional-design** — SKIPPED. The math operations are fully defined by the requirements; no separate domain model or business-rule layer is warranted for a calculator utility.
- **nfr-assessment** — SKIPPED. Tech stack is pre-specified (Python 3.13, FastAPI, uv, pytest, ruff). NFR targets (≥90% coverage, ≤1 ULP precision) are already defined in the vision. Defaults are adequate.
- **nfr-design** — SKIPPED. No complex non-functional patterns needed beyond standard FastAPI middleware.
- **infrastructure-design** — SKIPPED. No deployment infrastructure in scope for this MVP.
- **build-and-test** — EXCLUDED. Skill is not yet implemented (🚧 in catalogue).

## Summary

Two-skill workflow: requirements-analysis → code-generation. This is the minimal viable pipeline for a greenfield single-component utility where the domain logic IS the requirements.
