# Code Generation Plan — sci-calc

**Skill:** code-generation:sci-calc
**Unit:** sci-calc
**Date:** 2025-01-27
**Status:** Approved

---

## Objective

Generate the complete source code for the Scientific Calculator API as specified in the vision document, technical environment document, requirements.md, nfr-requirements.md, and tech-stack-decisions.md. Implement all 29 functional requirements with proper error handling, logging, testing, and project configuration.

## Design Decisions (from Clarification)

| # | Decision | Choice |
|---|----------|--------|
| Q1 | Error handling | Custom exception hierarchy with global handler |
| Q2 | Logging | ASGI middleware for request/response logging |
| Q3 | Request models | Shared base models (~8-10 Pydantic models) |
| Q4 | Engine decomposition | Single math_engine.py per tech-env.md |
| Q5 | Test organization | Combined per-category files (unit + integration) |
| Q6 | Input validation | Custom FiniteFloat annotated type |
| Q7 | Response models | Pydantic response models for envelopes |

## Plan Steps

### Step 1: Project Configuration
- [x] Write `pyproject.toml` with hatchling build backend, all dependencies, ruff config, pytest config
- [x] Target: Python >=3.13, deps: fastapi, uvicorn, pydantic; dev deps: pytest, pytest-asyncio, pytest-cov, httpx, ruff

### Step 2: Models Layer (`src/sci_calc/models/`)
- [x] `requests.py` — FiniteFloat type, SingleOperand, DualOperand, TrigInput, Atan2Input, PowerInput, NthRootInput, StatisticsInput, ConversionInput, LogInput
- [x] `responses.py` — SuccessResponse, ErrorResponse, ErrorDetail models
- [x] `__init__.py` — re-exports

### Step 3: Engine Layer (`src/sci_calc/engine/`)
- [x] `math_engine.py` — Pure functions for all 7 operation categories (arithmetic, powers, trigonometry, logarithmic, statistics, constants, conversions)
- [x] Custom exceptions: CalculatorError, DivisionByZeroError, DomainError, OverflowError
- [x] `__init__.py` — re-exports

### Step 4: Routes Layer (`src/sci_calc/routes/`)
- [x] `arithmetic.py` — POST /api/v1/arithmetic/{operation}
- [x] `powers.py` — POST /api/v1/powers/{operation}
- [x] `trigonometry.py` — POST /api/v1/trigonometry/{operation}
- [x] `logarithmic.py` — POST /api/v1/logarithmic/{operation}
- [x] `statistics.py` — POST /api/v1/statistics/{operation}
- [x] `constants.py` — GET /api/v1/constants, GET /api/v1/constants/{name}
- [x] `conversions.py` — POST /api/v1/conversions/{category}
- [x] `__init__.py` — router aggregation

### Step 5: Application Layer (`src/sci_calc/`)
- [x] `app.py` — FastAPI app creation, CORS middleware, logging middleware, exception handlers, router inclusion, health endpoint
- [x] `__init__.py` — version constant

### Step 6: Tests (`tests/`)
- [x] `conftest.py` — AsyncClient fixture
- [x] `test_arithmetic.py` — unit + integration tests for all arithmetic operations
- [x] `test_powers.py` — unit + integration tests for power operations
- [x] `test_trigonometry.py` — unit + integration tests for trig operations
- [x] `test_logarithmic.py` — unit + integration tests for log operations
- [x] `test_statistics.py` — unit + integration tests for statistics operations
- [x] `test_constants.py` — unit + integration tests for constants
- [x] `test_conversions.py` — unit + integration tests for unit conversions
- [x] `__init__.py`

### Step 7: Verification
- [x] All files follow prescribed project structure from tech-env.md
- [x] Ruff compliance (line-length 100, target py313)
- [x] All 29 FRs have corresponding test coverage
- [x] Error envelope format consistent across all error types

## File Manifest

| # | File | Purpose |
|---|------|---------|
| 1 | `pyproject.toml` | Project config, deps, tool config |
| 2 | `src/sci_calc/__init__.py` | Package init, version |
| 3 | `src/sci_calc/app.py` | FastAPI app, middleware, handlers |
| 4 | `src/sci_calc/models/__init__.py` | Models package |
| 5 | `src/sci_calc/models/requests.py` | Request Pydantic models |
| 6 | `src/sci_calc/models/responses.py` | Response Pydantic models |
| 7 | `src/sci_calc/engine/__init__.py` | Engine package |
| 8 | `src/sci_calc/engine/math_engine.py` | All math logic |
| 9 | `src/sci_calc/routes/__init__.py` | Routes package |
| 10 | `src/sci_calc/routes/arithmetic.py` | Arithmetic endpoints |
| 11 | `src/sci_calc/routes/powers.py` | Powers endpoints |
| 12 | `src/sci_calc/routes/trigonometry.py` | Trig endpoints |
| 13 | `src/sci_calc/routes/logarithmic.py` | Log endpoints |
| 14 | `src/sci_calc/routes/statistics.py` | Statistics endpoints |
| 15 | `src/sci_calc/routes/constants.py` | Constants endpoints |
| 16 | `src/sci_calc/routes/conversions.py` | Conversions endpoints |
| 17 | `tests/__init__.py` | Tests package |
| 18 | `tests/conftest.py` | Test fixtures |
| 19 | `tests/test_arithmetic.py` | Arithmetic tests |
| 20 | `tests/test_powers.py` | Powers tests |
| 21 | `tests/test_trigonometry.py` | Trig tests |
| 22 | `tests/test_logarithmic.py` | Log tests |
| 23 | `tests/test_statistics.py` | Statistics tests |
| 24 | `tests/test_constants.py` | Constants tests |
| 25 | `tests/test_conversions.py` | Conversions tests |

## Success Criteria

- All tests pass with `uv run pytest`
- >= 90% line coverage
- Results match Python `math` stdlib to <= 1 ULP
- All error codes produce correct HTTP status and envelope format
- Project structure matches tech-env.md exactly
