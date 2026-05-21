# Workflow Composition Questions

## Q1: Should reverse-engineering run?

[Context]: The bootstrap-context.md classifies this as greenfield with no repos in scope and no integration targets.
[Recommendation]: No. Greenfield project with an empty workspace — nothing to reverse-engineer.
[Answer]: No — skip reverse-engineering. Greenfield, no existing code.

## Q2: Should user-stories be included?

[Context]: This is a single-actor (API client), single-component utility. The operations are well-defined in the vision: arithmetic, trigonometry, logarithms, powers, statistics, constants, unit conversions.
[Recommendation]: No. One obvious actor, straightforward happy paths defined by the operations list. User stories would not add value beyond what requirements-analysis captures.
[Answer]: No — skip user-stories. Single actor, well-defined operations; requirements doc suffices.

## Q3: Should application-design be included?

[Context]: Single component (one FastAPI service). No multi-component orchestration needed.
[Recommendation]: No. Single component, no orchestration, no component boundary decisions to make.
[Answer]: No — skip application-design. Single component, no orchestration.

## Q4: Should units-generation be included?

[Context]: There is only one unit (the calculator API). Trivially one unit; no fan-out needed.
[Recommendation]: No. Single unit named "sci-calc" is trivially determined from the intent.
[Answer]: No — skip units-generation. Single unit (sci-calc) is trivially determined.

## Q5: Should functional-design be included?

[Context]: The business logic IS the math operations. The requirements document will capture the full operation list, inputs, outputs, and error cases.
[Recommendation]: No. The logic is the requirements — no separate domain model or business rules layer needed for a calculator.
[Answer]: No — skip functional-design. Math operations are fully specified by requirements.

## Q6: Should nfr-assessment, nfr-design, or infrastructure-design be included?

[Context]: This is an MVP utility API. No complex NFR decisions beyond what's already stated (≥90% coverage, ≤1 ULP precision). No deployment infrastructure needed for the scope of this intent.
[Recommendation]: No. Defaults are fine; tech stack is already specified in tech-env.md.
[Answer]: No — skip all three. NFR defaults are adequate; tech stack is pre-specified.

## Q7: Should build-and-test be included?

[Context]: The build-and-test skill is marked 🚧 (not yet implemented) in the catalogue.
[Recommendation]: No. The skill is not yet implemented.
[Answer]: No — exclude build-and-test (not implemented).

## Q8: Any per-skill flag overrides needed?

[Context]: requirements-analysis and code-generation both have default flags (all true). No reason to override for this straightforward intent.
[Recommendation]: No overrides. Default flags are appropriate.
[Answer]: No flag overrides needed. Use defaults for both skills.
