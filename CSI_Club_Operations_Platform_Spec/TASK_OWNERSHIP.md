# 50/50 Ownership Plan

## Project owner — approximately 50%

### Requirements
- define certificate rules;
- define coordinator rules;
- define member classifications;
- define allocation reset behavior;
- define Notion source-of-truth/conflict policy.

### Infrastructure
- create/configure PostgreSQL;
- create/configure object storage;
- create/configure Redis/queue if required;
- create/configure Notion integration;
- provide environment variables securely.

### Data
- create/approve initial member data;
- verify event data;
- verify Notion mappings.

### Review
- test real certificates;
- verify allocation decisions;
- approve UI;
- perform user acceptance testing.

## Antigravity — approximately 50%

### Application
- frontend;
- backend;
- API;
- authentication integration;
- member/event management;
- coordinator engine;
- certificate processing;
- batch jobs;
- Notion adapter;
- audit logging.

### Quality
- unit tests;
- integration tests;
- E2E tests;
- error handling;
- accessibility;
- responsive UI.

### Documentation
- setup;
- environment variables;
- API documentation;
- operations guide;
- deployment guide.

## Shared decisions

Both sides review:
- architecture;
- database schema;
- business-rule interpretation;
- production deployment;
- security;
- final acceptance.
