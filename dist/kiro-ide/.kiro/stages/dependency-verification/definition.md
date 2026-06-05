# Dependency Verification

## Description

Connect the generated code to real external dependencies — databases, queues, caches, third-party APIs, file systems — and verify it works against them instead of mocks. The code and real adapter implementations already exist from code-generation. This stage configures real connections, requests access from the human if needed, and runs the system against actual dependencies.

## Inputs

- **Required:** Generated code (from code-generation) with factory/adapter abstractions in place
- **Optional context:** infrastructure-design artifacts (service-mapping, deployment-architecture), deployment scripts (if deployment to a lower environment is needed before verification)

## Outputs

Artifacts this stage can produce. The owner's plan determines which are relevant. Additional artifacts may be produced if warranted.

- Verified working connections to all real dependencies
- Configuration files updated with real connection details
- Integration test results against real dependencies
- List of verified vs unverified dependencies (if some require deployment first)

## Owner

aidlc-sw-dev-engineer-agent

## Contributors

- aidlc-systems-architect-agent: validate connection patterns and infrastructure alignment

## Reviewer

aidlc-code-reviewer-agent
