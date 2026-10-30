# AGENTS.md — Antigravity Implementation Instructions

## Role

You are the primary implementation agent for the CSI Club Operations Platform.

Build a production-quality application from the specification in this repository. Do not treat this as a demo or a generic CRUD dashboard.

## Read before coding

Read these files in this order:

1. `PROJECT_CONTEXT.md`
2. `REQUIREMENTS.md`
3. `BUSINESS_RULES.md`
4. `UI_UX_SPEC.md`
5. `ARCHITECTURE.md`
6. `DATABASE_SPEC.md`
7. `CERTIFICATE_VALIDATION.md`
8. `COORDINATOR_ENGINE.md`
9. `NOTION_INTEGRATION.md`
10. `SECURITY.md`
11. `TESTING.md`
12. `DEPLOYMENT.md`
13. `TASK_OWNERSHIP.md`

## Non-negotiable rules

- Do not invent club business rules. If a rule is marked `OWNER INPUT REQUIRED`, stop and ask for it or implement it behind configuration.
- Do not replace the supplied UI direction with a generic admin-template design.
- Prioritize usability, hierarchy, responsiveness, accessibility, loading states, empty states, errors, and real-world edge cases.
- Use reusable components and a consistent design system.
- Never put secrets or Notion credentials in client-side code.
- Do not process 400 certificates in one blocking HTTP request.
- Bulk certificate processing must be asynchronous and resilient to individual-file failures.
- A failed certificate must not fail the entire batch.
- Store enough validation information to explain why a certificate failed.
- Coordinator allocation must be deterministic/reproducible when given the same state and rules.
- Do not silently overwrite Notion changes. Conflicts must have an explicit strategy.
- Add structured logging around certificate jobs, allocation runs, and Notion synchronization.
- Validate inputs on the server even if the UI validates them.
- Use migrations for database changes.
- Add tests for business-critical rules.

## Working style

Implement in vertical slices:

1. Foundation/auth/navigation
2. Members and events
3. Coordinator allocation
4. Certificate batch pipeline
5. Notion integration
6. Dashboard/reporting
7. Hardening, testing, deployment

After each slice, keep the application runnable.

## Human ownership

The project owner will:
- provide/finalize club business rules;
- create/configure the database;
- create/configure external credentials and integrations;
- review major architectural decisions;
- test real club workflows;
- approve production deployment.

Antigravity will:
- implement the application;
- implement the UI;
- implement APIs/services;
- implement validation and allocation engines;
- implement integration adapters;
- implement tests;
- document setup and operation.

See `TASK_OWNERSHIP.md`.
