# Implementation Plan

## Phase 0 — Requirements freeze

Owner provides:
- `BUSINESS_RULES.md`;
- certificate examples;
- certificate rule list;
- Notion database structure;
- roles;
- allocation examples.

Do not skip this phase.

## Phase 1 — Foundation

Antigravity:
- initialize repository;
- establish architecture;
- establish design system;
- authentication;
- navigation;
- error handling;
- database connection layer.

Owner:
- configure database;
- provide environment setup.

## Phase 2 — Members + Events

Build:
- member CRUD;
- event CRUD;
- status management;
- history.

## Phase 3 — Coordinator Engine

Build:
- constraint engine;
- allocation UI;
- allocation history;
- cycle/reset behavior;
- tests.

Owner validates real examples.

## Phase 4 — Certificate Pipeline

Build:
- batch upload;
- object storage;
- job queue;
- workers;
- rule engine;
- result UI;
- exports.

Use real certificate samples for validation.

## Phase 5 — Notion

Build:
- authentication/config;
- mapping;
- import;
- sync;
- conflict handling;
- retry/error UI.

## Phase 6 — Production hardening

- security;
- performance;
- accessibility;
- 400-file load test;
- monitoring;
- backups;
- CI/CD.

## Phase 7 — Deployment

Owner configures production infrastructure.
Antigravity performs final deployment work and verification.

## Phase 8 — GitHub

Before push:
- remove secrets;
- add `.env.example`;
- verify README;
- verify migrations;
- verify tests;
- verify build;
- verify no certificate/user data is accidentally committed.
