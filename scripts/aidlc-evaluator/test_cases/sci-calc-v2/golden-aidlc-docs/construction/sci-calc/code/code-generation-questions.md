# Code Generation Questions — sci-calc

Skill: aidlc-code-generation
Unit: sci-calc
Intent: intent-001-scientific-calculator-api
Created: 2025-07-22T11:00:00Z

---

### Q1: How should the conversion factors be organised in code?

a) A single `conversions.py` engine module with dictionaries/lookup tables for all categories
b) One sub-module per category (`angle.py`, `temperature.py`, `length.py`, `weight.py`) inside `engine/conversions/`
c) A data-driven approach with YAML/JSON files defining conversion factors, loaded at startup
d) Other

**Trade Offs:** Option (a) is simplest and keeps the codebase flat, matching the existing `math_engine.py` pattern in tech-env. Option (b) offers better separation but adds more files. Option (c) separates data from logic but adds a file-loading concern.

**Recommendation:** (a) — A single `engine/conversions.py` module with dictionaries. Keeps the same flat engine pattern shown in tech-env.md, and conversion factors are compile-time constants that don't benefit from externalisation.

[Answer]: A

Agreed. A single `engine/conversions.py` with dictionaries is the simplest approach, matches the flat engine pattern in tech-env.md, and conversion factors are just constants. No need for external files or sub-modules at this scale.

---

### Q2: What error handling pattern should be used internally?

a) Custom exception classes (e.g., `DomainError`, `DivisionByZeroError`) raised by the engine, caught and translated to error envelopes in route handlers
b) Engine functions return `Result` tuples/objects (`(value, error)`) and routes inspect the result
c) Engine functions raise standard Python exceptions (`ValueError`, `ZeroDivisionError`) and routes catch and translate them
d) Other

**Trade Offs:** Option (a) gives clear, domain-specific exceptions with explicit semantics — easy to map to error codes. Option (b) avoids exceptions but makes every call site check for errors explicitly. Option (c) reuses stdlib exceptions but loses semantic clarity (a `ValueError` could mean many things).

**Recommendation:** (a) — Custom exception classes in a dedicated `exceptions.py` module. Each exception carries the error code and message, making the route-level error handler trivial and testable.

[Answer]: A

Custom exception classes are the right choice. They map cleanly to the error envelope codes defined in the vision (DIVISION_BY_ZERO, DOMAIN_ERROR, OVERFLOW, INVALID_INPUT, INTERNAL_ERROR). A single exception handler in the app can catch them all and produce the correct structured response. Put them in `engine/exceptions.py` or a top-level `exceptions.py`.

---

### Q3: How should the test suite be structured?

a) One test file per route module (matching the structure in tech-env.md) with both unit tests (calling engine directly) and integration tests (using httpx async client) in the same file
b) Separate `tests/unit/` and `tests/integration/` directories
c) One test file per route module for integration tests, plus a separate `tests/test_engine.py` for pure unit tests of the math engine
d) Other

**Trade Offs:** Option (a) matches tech-env.md's proposed structure exactly. Option (b) separates concerns but adds directory depth. Option (c) provides good separation while keeping the flat test structure from tech-env.md, clearly distinguishing engine-only tests from API-level tests.

**Recommendation:** (a) — Follow the exact structure defined in tech-env.md. Each `test_*.py` file covers both direct engine calls (unit) and HTTP endpoint calls (integration) for its domain area. This keeps things simple and aligned with the prescribed project structure.

[Answer]: A

Follow tech-env.md exactly. The prescribed test file structure is clear and sufficient. Each `test_*.py` file should contain both unit tests (calling the engine directly) and integration tests (via httpx async client) for its domain. This avoids adding unnecessary directory structure.

---

### Q4: Should the `math_engine.py` be a single file or split into domain-specific engine modules?

a) Single `engine/math_engine.py` containing all calculation logic (as shown in tech-env.md)
b) Split into `engine/arithmetic.py`, `engine/trigonometry.py`, `engine/logarithmic.py`, `engine/powers.py`, `engine/statistics.py` with `math_engine.py` as a façade
c) Split into domain modules without a façade — routes import directly from domain-specific engine modules
d) Other

**Trade Offs:** Option (a) follows tech-env.md literally but will result in a large file (~300+ lines). Option (b) keeps the existing import path stable while splitting logic. Option (c) is cleanest but deviates from tech-env.md's prescribed structure.

**Recommendation:** (a) — Follow tech-env.md as written. A single `math_engine.py` for all calculations. The file will be large but still manageable for this scope (~300–400 lines), and it matches the prescribed project structure exactly.

[Answer]: A

Follow tech-env.md exactly — single `engine/math_engine.py`. 300-400 lines is perfectly manageable for pure calculation functions, and it matches the prescribed structure. No reason to deviate here.

---

### Q5: How should the health endpoint be routed?

a) In `app.py` directly (since it's a single trivial endpoint)
b) In a dedicated `routes/health.py` module
c) Other

**Trade Offs:** Option (a) keeps trivial infrastructure out of the routes package. Option (b) maintains consistency — every endpoint has a route file.

**Recommendation:** (a) — Define the health endpoint directly in `app.py`. It's a single GET with no business logic, and placing it in `app.py` keeps the routes directory focused on calculator operations.

[Answer]: A

Agreed. The health endpoint is a single trivial GET that returns a static JSON object. It belongs in `app.py` directly. No need for a separate route file for this.

---

### Q6: What layer ordering should the code-generation plan follow?

a) Models → Engine → Routes → App/Config (bottom-up, dependencies first)
b) App/Config → Routes → Engine → Models (top-down, API surface first)
c) Models + Exceptions → Engine + Tests → Routes + Tests → App/Config + Integration Tests
d) Other

**Trade Offs:** Option (a) ensures each layer compiles without forward references. Option (b) gives visible API surface early but requires stubs. Option (c) co-locates tests with each layer for immediate verification per the skill's layer rules.

**Recommendation:** (c) — Models and exceptions first (Layer 1), then engine logic with its unit tests (Layer 2), then routes with their tests (Layer 3), then app assembly, config, and final integration tests (Layer 4). This satisfies the skill's requirement that each layer compiles independently and tests are co-located.

[Answer]: C

This is the right ordering. Build bottom-up with tests at each layer: (1) models + exceptions, (2) engine + unit tests, (3) routes + route tests, (4) app assembly + config + conftest + integration wiring. Each layer is independently verifiable before moving to the next.
