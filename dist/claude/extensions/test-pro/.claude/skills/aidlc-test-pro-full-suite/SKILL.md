---
name: aidlc-test-pro-full-suite
description: >
  Run the AI-DLC `test-pro-full-suite` stage (operation phase) in isolation, without
  advancing the main workflow. Packages `/aidlc --stage test-pro-full-suite --single`:
  the engine emits one run-stage directive for test-pro-full-suite and its gate, the
  conductor runs it, then the single-stage run commits a synthetic-id pair and
  stops. The main workflow's Current Stage is never touched.
argument-hint: ""
user-invocable: true
---

# AI-DLC Stage Runner — test-pro-full-suite

Run the `test-pro-full-suite` stage on its own. This is opt-in packaging over
`/aidlc --stage test-pro-full-suite --single`; the same stage is always reachable via
that flag without this skill.

## Steps

1. Ask the engine for the single-stage directive:

   ```bash
   bun .claude/tools/aidlc-orchestrate.ts next --stage test-pro-full-suite --single
   ```

   The engine emits one `run-stage` directive for `test-pro-full-suite` (carrying the
   lead agent, the resolved consumes/produces paths, the rules and sensors in
   context, and — on this first directive — the conductor persona). Run the stage
   exactly as the directive describes; do not load the conductor persona by hand,
   the engine delivers it.

2. When the stage's work is done, commit the single-stage record:

   ```bash
   bun .claude/tools/aidlc-orchestrate.ts report --single --stage test-pro-full-suite --result completed
   ```

   This records a STAGE_STARTED / STAGE_COMPLETED pair under a synthetic workflow
   id and stops. It NEVER writes the main workflow's `Current Stage` — a
   single-stage run is isolated by design (the tool refuses to advance the main
   workflow).
