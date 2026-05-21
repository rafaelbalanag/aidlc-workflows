# Requirements — Scientific Calculator API

intent: scientific-calculator-api
skill: requirements-analysis
created: 2025-01-22T11:20:00Z

---

## 1. Intent Summary

| Attribute | Value |
|---|---|
| Type | New feature (greenfield) |
| Scope | Single component — stateless HTTP API |
| Complexity | Moderate — multiple operation categories (7 route groups), structured error handling, comprehensive test coverage |
| Classification | Greenfield |
| Affected Repos | None (new project) |
| Target Location | `workspace/sci-calc/` |

The Scientific Calculator API is a stateless HTTP service that performs scientific math operations — arithmetic, trigonometry, logarithms, powers & roots, statistics, constants retrieval, and unit conversions — exposed via versioned JSON endpoints. It prioritises correctness, precision, and clear error reporting.

---

## 2. Functional Requirements

### Arithmetic

| ID | Requirement |
|---|---|
| FR-1 | The API SHALL expose `POST /api/v1/arithmetic/add` accepting `{"a": N, "b": N}` and returning their sum. |
| FR-2 | The API SHALL expose `POST /api/v1/arithmetic/subtract` accepting `{"a": N, "b": N}` and returning `a - b`. |
| FR-3 | The API SHALL expose `POST /api/v1/arithmetic/multiply` accepting `{"a": N, "b": N}` and returning their product. |
| FR-4 | The API SHALL expose `POST /api/v1/arithmetic/divide` accepting `{"a": N, "b": N}` and returning `a / b`. If `b == 0`, the API SHALL return HTTP 400 with error code `DIVISION_BY_ZERO`. |
| FR-5 | The API SHALL expose `POST /api/v1/arithmetic/modulo` accepting `{"a": N, "b": N}` and returning `a % b`. If `b == 0`, the API SHALL return HTTP 400 with error code `DIVISION_BY_ZERO`. |
| FR-6 | The API SHALL expose `POST /api/v1/arithmetic/abs` accepting `{"a": N}` and returning the absolute value of `a`. |
| FR-7 | The API SHALL expose `POST /api/v1/arithmetic/negate` accepting `{"a": N}` and returning `-a`. |

### Powers & Roots

| ID | Requirement |
|---|---|
| FR-8 | The API SHALL expose `POST /api/v1/powers/power` accepting `{"base": N, "exponent": N}` and returning `base ** exponent`. |
| FR-9 | The API SHALL expose `POST /api/v1/powers/sqrt` accepting `{"a": N}` and returning the square root of `a`. If `a < 0`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-10 | The API SHALL expose `POST /api/v1/powers/cbrt` accepting `{"a": N}` and returning the cube root of `a`. |
| FR-11 | The API SHALL expose `POST /api/v1/powers/square` accepting `{"a": N}` and returning `a²`. |
| FR-12 | The API SHALL expose `POST /api/v1/powers/nth_root` accepting `{"a": N, "n": int}` and returning the n-th root of `a`. If `a < 0` and `n` is even, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |

### Trigonometry

| ID | Requirement |
|---|---|
| FR-13 | The API SHALL expose `POST /api/v1/trigonometry/sin` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` (default: `"radians"`) and returning sin(a). |
| FR-14 | The API SHALL expose `POST /api/v1/trigonometry/cos` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` (default: `"radians"`) and returning cos(a). |
| FR-15 | The API SHALL expose `POST /api/v1/trigonometry/tan` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` (default: `"radians"`) and returning tan(a). |
| FR-16 | The API SHALL expose `POST /api/v1/trigonometry/asin` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning arcsin(a). If `a < -1` or `a > 1`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-17 | The API SHALL expose `POST /api/v1/trigonometry/acos` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning arccos(a). If `a < -1` or `a > 1`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-18 | The API SHALL expose `POST /api/v1/trigonometry/atan` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning arctan(a). |
| FR-19 | The API SHALL expose `POST /api/v1/trigonometry/atan2` accepting `{"y": N, "x": N, "angle_unit": "radians"|"degrees"}` (default: `"radians"`) and returning atan2(y, x). |
| FR-20 | The API SHALL expose `POST /api/v1/trigonometry/sinh` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning sinh(a). |
| FR-21 | The API SHALL expose `POST /api/v1/trigonometry/cosh` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning cosh(a). |
| FR-22 | The API SHALL expose `POST /api/v1/trigonometry/tanh` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning tanh(a). |
| FR-23 | The API SHALL expose `POST /api/v1/trigonometry/asinh` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning asinh(a). |
| FR-24 | The API SHALL expose `POST /api/v1/trigonometry/acosh` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning acosh(a). If `a < 1`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-25 | The API SHALL expose `POST /api/v1/trigonometry/atanh` accepting `{"a": N, "angle_unit": "radians"|"degrees"}` and returning atanh(a). If `a <= -1` or `a >= 1`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-26 | For all trigonometry endpoints, when `angle_unit` is `"degrees"`, the API SHALL convert input angles from degrees to radians before computation and convert output angles from radians to degrees for inverse functions. |

### Logarithms

| ID | Requirement |
|---|---|
| FR-27 | The API SHALL expose `POST /api/v1/logarithmic/ln` accepting `{"a": N}` and returning the natural logarithm of `a`. If `a <= 0`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-28 | The API SHALL expose `POST /api/v1/logarithmic/log10` accepting `{"a": N}` and returning log base 10 of `a`. If `a <= 0`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-29 | The API SHALL expose `POST /api/v1/logarithmic/log2` accepting `{"a": N}` and returning log base 2 of `a`. If `a <= 0`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-30 | The API SHALL expose `POST /api/v1/logarithmic/log` accepting `{"a": N, "base": N}` and returning log base `base` of `a`. If `a <= 0`, `base <= 0`, or `base == 1`, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-31 | The API SHALL expose `POST /api/v1/logarithmic/exp` accepting `{"a": N}` and returning `e^a`. If the result exceeds the representable float64 range, the API SHALL return HTTP 400 with error code `OVERFLOW`. |

### Statistics

| ID | Requirement |
|---|---|
| FR-32 | The API SHALL expose `POST /api/v1/statistics/mean` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the arithmetic mean. |
| FR-33 | The API SHALL expose `POST /api/v1/statistics/median` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the median value. |
| FR-34 | The API SHALL expose `POST /api/v1/statistics/mode` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the mode. On ties, the API SHALL return the smallest mode. |
| FR-35 | The API SHALL expose `POST /api/v1/statistics/stdev` accepting `{"values": [N, ...]}` (minimum 2 elements) and returning the sample standard deviation. If fewer than 2 elements are provided, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-36 | The API SHALL expose `POST /api/v1/statistics/variance` accepting `{"values": [N, ...]}` (minimum 2 elements) and returning the sample variance. If fewer than 2 elements are provided, the API SHALL return HTTP 400 with error code `DOMAIN_ERROR`. |
| FR-37 | The API SHALL expose `POST /api/v1/statistics/pstdev` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the population standard deviation. |
| FR-38 | The API SHALL expose `POST /api/v1/statistics/pvariance` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the population variance. |
| FR-39 | The API SHALL expose `POST /api/v1/statistics/min` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the minimum value. |
| FR-40 | The API SHALL expose `POST /api/v1/statistics/max` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the maximum value. |
| FR-41 | The API SHALL expose `POST /api/v1/statistics/sum` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the sum of all values. |
| FR-42 | The API SHALL expose `POST /api/v1/statistics/count` accepting `{"values": [N, ...]}` (minimum 1 element) and returning the number of elements. |

### Constants

| ID | Requirement |
|---|---|
| FR-43 | The API SHALL expose `GET /api/v1/constants` returning a JSON object mapping all constant names to their values. Finite constants (pi, e, tau, golden_ratio, sqrt2, ln2, ln10) SHALL be returned as JSON numbers. Non-finite constants (inf, nan) SHALL be returned as JSON string representations (`"Infinity"`, `"NaN"`). |
| FR-44 | The API SHALL expose `GET /api/v1/constants/{name}` returning the named constant's value in the standard success envelope. Non-finite constants SHALL use string representations in the `result` field. If the name is not recognized, the API SHALL return HTTP 404 with error code `NOT_FOUND`. |

### Unit Conversions

| ID | Requirement |
|---|---|
| FR-45 | The API SHALL expose `POST /api/v1/conversions/angle` accepting `{"value": N, "from_unit": str, "to_unit": str}` and converting between degrees, radians, and gradians using hardcoded float64 conversion factors. |
| FR-46 | The API SHALL expose `POST /api/v1/conversions/temperature` accepting `{"value": N, "from_unit": str, "to_unit": str}` and converting between celsius, fahrenheit, and kelvin using hardcoded float64 conversion formulas. |
| FR-47 | The API SHALL expose `POST /api/v1/conversions/length` accepting `{"value": N, "from_unit": str, "to_unit": str}` and converting between meters, feet, inches, centimeters, millimeters, kilometers, miles, and yards using hardcoded float64 conversion factors. |
| FR-48 | The API SHALL expose `POST /api/v1/conversions/weight` accepting `{"value": N, "from_unit": str, "to_unit": str}` and converting between kilograms, pounds, ounces, grams, milligrams, tonnes, and stones using hardcoded float64 conversion factors. |

### Health Check

| ID | Requirement |
|---|---|
| FR-49 | The API SHALL expose `GET /health` returning `{"status": "ok", "version": "0.1.0"}` with HTTP 200. |

### Error Handling

| ID | Requirement |
|---|---|
| FR-50 | The API SHALL reject all special floating-point input values (NaN, Infinity, -Infinity) at the Pydantic validation layer, returning HTTP 422 with error code `INVALID_INPUT` and a descriptive message including the offending field. |
| FR-51 | The API SHALL return HTTP 400 with error code `DIVISION_BY_ZERO` when a division or modulo operation receives a zero divisor. |
| FR-52 | The API SHALL return HTTP 400 with error code `DOMAIN_ERROR` when an input falls outside the mathematical domain of the operation (e.g., sqrt of negative, log of non-positive, asin of value outside [-1, 1]). |
| FR-53 | The API SHALL return HTTP 400 with error code `OVERFLOW` when a computation result exceeds the representable float64 range. |
| FR-54 | The API SHALL catch all unexpected exceptions, log them at ERROR level, and return a generic structured error response with error code `INTERNAL_ERROR` — never exposing a bare HTTP 500 to the client. |

### Response Envelope

| ID | Requirement |
|---|---|
| FR-55 | All API responses SHALL use a consistent JSON envelope: success responses contain `{"status": "ok", "operation": "<name>", "inputs": {...}, "result": <value>}` and error responses contain `{"status": "error", "operation": "<name>", "inputs": {...}, "error": {"code": "<CODE>", "message": "..."}}`. |

---

## 3. Non-Functional Requirements

| ID | Requirement | Metric |
|---|---|---|
| NFR-1 | Response latency for any single operation SHALL be below p95 threshold. | p95 < 50 ms |
| NFR-2 | Test suite SHALL achieve minimum line coverage. | ≥ 90% line coverage |
| NFR-3 | Mathematical results SHALL agree with Python `math` stdlib within tolerance. | ≤ 1 ULP difference |
| NFR-4 | Application startup time SHALL be fast enough for container orchestration. | < 2 seconds |
| NFR-5 | Maximum request body size SHALL be limited to prevent abuse. | 1 MB |
| NFR-6 | The project SHALL require Python 3.13.x. | `requires-python = ">=3.13"` in pyproject.toml |
| NFR-7 | API versioning SHALL use URL path prefix. | All endpoints under `/api/v1/` |
| NFR-8 | Logging SHALL use Python standard logging with JSON formatting; INFO for requests, ERROR for exceptions. | No DEBUG in production |
| NFR-9 | Validation errors SHALL include Pydantic field-level detail in the error message. | Format: "Validation failed: field X - details" with `INVALID_INPUT` code |

---

## 4. Assumptions

> **Note:** The following are assumptions, not confirmed facts. They may require validation during construction.

1. **ASSUMPTION:** The API is stateless — no database, session store, or persistent state is required between requests.
2. **ASSUMPTION:** The API will run as a single-process uvicorn instance (no multi-worker or distributed deployment needed for MVP).
3. **ASSUMPTION:** Python's `math` stdlib provides sufficient precision for all scientific operations — no third-party math libraries are needed.
4. **ASSUMPTION:** Unit conversion factors are well-known, exact values (where mathematically exact) hardcoded as float64 constants — no external data sources or configuration files needed.
5. **ASSUMPTION:** The 1 MB request body limit (provided by the server framework) is sufficient to cap statistics list sizes without an explicit element-count limit.
6. **ASSUMPTION:** All numeric inputs are IEEE 754 double-precision (float64) values, excluding the special values NaN, Infinity, and -Infinity which are rejected at validation.
7. **ASSUMPTION:** The initial release version is `0.1.0` as stated in the vision.

---

## 5. Out of Scope

The following capabilities are explicitly excluded from this intent's scope:

1. **Factorial operation** — Not listed in the vision's operations; may be added in a future version.
2. **Persistent storage or user accounts** — The API is stateless with no data persistence.
3. **Graphical or terminal UI** — API-only; no frontend.
4. **Symbolic / computer-algebra (CAS) capabilities** — Numeric computation only.
5. **Arbitrary-precision or big-number libraries** beyond Python's standard `decimal` module.
6. **Authentication, rate-limiting, or production hardening** — Not required for MVP.
7. **Expression evaluation from string input** — No expression parser; each operation is a dedicated endpoint.
8. **Multi-worker or distributed deployment** — Single-process uvicorn for MVP.
9. **Custom precision configuration** — All operations use float64; no user-selectable precision.

---

## Traceability

| Vision Feature | Requirements |
|---|---|
| Arithmetic | FR-1 through FR-7 |
| Powers and roots | FR-8 through FR-12 |
| Trigonometry | FR-13 through FR-26 |
| Logarithms | FR-27 through FR-31 |
| Statistics | FR-32 through FR-42 |
| Constants | FR-43, FR-44 |
| Unit conversions | FR-45 through FR-48 |
| Health-check endpoint | FR-49 |
| Structured error responses | FR-50 through FR-55 |
| Unit and integration tests | NFR-2 |
