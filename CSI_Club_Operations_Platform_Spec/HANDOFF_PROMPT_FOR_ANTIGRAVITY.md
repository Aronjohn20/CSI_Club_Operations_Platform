# Antigravity Handoff Prompt

You are taking over implementation of the CSI Club Operations Platform.

Read `AGENTS.md` and all referenced specification files before making architectural or code changes.

The project has three core modules:
1. bulk certificate validation (up to 400 files);
2. constraint-based coordinator allocation;
3. two-way Notion synchronization.

The owner will supply the final club business rules in `BUSINESS_RULES.md` and will separately configure the database/external services.

Do not invent missing business rules.

The UI must closely follow the supplied CSI Student Branch visual identity:
- dark near-black/navy base;
- purple and dark-blue atmosphere;
- restrained magenta accent;
- white typography;
- subtle borders and rounded controls;
- premium, clean, modern feel;
- no generic admin dashboard aesthetic.

Implement production-quality behavior:
- async certificate processing;
- resilient jobs;
- per-file failure isolation;
- transparent validation results;
- deterministic allocation;
- historical allocation tracking;
- secure Notion integration;
- auditability;
- tests;
- responsive/accessibility support.

Before implementation:
1. summarize the architecture you intend to use;
2. identify any unresolved requirements in `BUSINESS_RULES.md`;
3. identify any database/infrastructure inputs needed from the owner;
4. propose the implementation order.

Then implement in phases and keep the application runnable after each phase.
