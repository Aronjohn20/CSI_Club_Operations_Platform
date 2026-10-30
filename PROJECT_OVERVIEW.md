# CSI Club Operations Platform - Documentation & Codebase Guide

This document provides a concise, easy-to-read index of **all documentation files** and **all code files** in this project, explaining what each does and why each programming language was chosen.

---

## 📑 1. Markdown Documentation Files (.md)

The project includes root repository guides and detailed architectural specifications in `CSI_Club_Operations_Platform_Spec/`.

### Root Documentation

| File | Purpose / What It Is Used For |
| :--- | :--- |
| [`README.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/README.md) | **Primary Project Guide:** Overview of the entire system architecture, features built (UI, Python backend, Supabase schema), setup instructions, and operational commands. |
| [`GITHUB_WORKFLOW_GUIDE.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/GITHUB_WORKFLOW_GUIDE.md) | **CI/CD & Git Workflow Guide:** Explains branching strategy, commit conventions, pull request checklist, and GitHub Actions automation. |

### Specification Directory (`CSI_Club_Operations_Platform_Spec/`)

| File | Purpose / What It Is Used For |
| :--- | :--- |
| [`AGENTS.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/AGENTS.md) | **AI Agent Operating Rules:** Guidelines, constraints, and instructions for AI agents working inside this repository. |
| [`ARCHITECTURE.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/ARCHITECTURE.md) | **System Architecture Blueprint:** High-level component diagrams, data flows, and interactions between Web UI, Supabase, and Python engines. |
| [`BUSINESS_RULES.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/BUSINESS_RULES.md) | **Core Domain Rules:** Exhaustive rules governing membership status, coordinator pairing requirements (1 New + 1 Old, workload limits), and certification criteria. |
| [`CERTIFICATE_VALIDATION.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/CERTIFICATE_VALIDATION.md) | **Certificate Verification Spec:** Acceptance criteria for student certificates (required phrases, forbidden text, date formats, word count, logo checks, SHA-256 deduplication). |
| [`COORDINATOR_ENGINE.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/COORDINATOR_ENGINE.md) | **Allocation Algorithm Spec:** Mathematical rules and constraints for assigning event coordinators equitably and preventing repeat pairings. |
| [`DATABASE_SPEC.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/DATABASE_SPEC.md) | **Database Design:** Details table definitions, relationships, indexes, enums, and Row Level Security (RLS) policies for Supabase PostgreSQL. |
| [`DEPLOYMENT.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/DEPLOYMENT.md) | **Vercel & Cloud Deployment Guide:** Production hosting for Vercel (Frontend & Edge CDN), Supabase (Database), and Render/Railway (Python) without Docker. |
| [`HANDOFF_PROMPT_FOR_ANTIGRAVITY.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/HANDOFF_PROMPT_FOR_ANTIGRAVITY.md) | **AI Agent Context Prompt:** Prompt used to prime the AI assistant with project background, scope, and technical context. |
| [`IMPLEMENTATION_PLAN.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/IMPLEMENTATION_PLAN.md) | **Roadmap & Phasing:** Step-by-step development roadmap tracking standalone milestones and deliverables. |
| [`PROJECT_CONTEXT.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/PROJECT_CONTEXT.md) | **CSI Organization Background:** Mission, organizational structure, student hierarchy, and historical operational challenges of the CSI Student Branch. |
| [`README.md` (Spec)](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/README.md) | **Spec Directory Index:** Quick summary and reading guide for all technical specification documents. |
| [`REQUIREMENTS.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/REQUIREMENTS.md) | **Functional & Non-Functional Requirements:** Detailed list of system capabilities, user roles, security benchmarks, and performance targets. |
| [`SECURITY.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/SECURITY.md) | **Security Standards:** Policies on environment secrets, API key handling, Supabase RLS, input sanitization, and audit trails. |
| [`TASK_OWNERSHIP.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/TASK_OWNERSHIP.md) | **Role Matrix:** Defines which team members or agents are responsible for each module. |
| [`TESTING.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/TESTING.md) | **Testing Strategy:** Instructions and coverage goals for unit tests, integration tests, and edge case simulations. |
| [`UI_UX_SPEC.md`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/CSI_Club_Operations_Platform_Spec/UI_UX_SPEC.md) | **Design & UI Specification:** Layouts, dark-mode color palette (`#090a12`, `#101222`, `#d946ef`), component states, modal flows, and accessibility guidelines. |

---

## 💻 2. Code Files & Programming Languages Used

### A. Python (`python/`)

#### Why Python?
* **Document Processing & OCR:** Python has the industry-standard libraries (`pypdf`, `pdfplumber`, `Pillow`) for extracting text, analyzing PDF structure, and detecting embedded images/logos.
* **Algorithmic Constraint Solving:** Clean syntax for scoring heuristics, combinatorial checks, and optimization algorithms.
* **Lightweight Microservices:** `FastAPI` enables high-performance asynchronous API endpoints for bulk jobs without heavy boilerplate.

#### Files & Descriptions
* [`python/allocation_engine.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/allocation_engine.py)  
  * **What it does:** Constraint-satisfaction engine that assigns coordinators to club events. Enforces business rules: exactly 1 New + 1 Old member, no duplicate historical pairings, and balanced workload distribution.
* [`python/certificate_validator.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/certificate_validator.py)  
  * **What it does:** Validates PDF certificates in bulk (up to 400 files). Checks for mandatory phrases, flags template placeholder text, parses dates, counts write-up words, calculates confidence scores, and generates SHA-256 hashes to prevent duplicate submissions.
* [`python/server.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/server.py)  
  * **What it does:** FastAPI HTTP server exposing REST endpoints (`/validate-certificates`, `/allocate-coordinators`, `/health`) to connect the Python backend with the frontend UI or external services.
* [`python/worker.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/worker.py)  
  * **What it does:** Background asynchronous worker that monitors job queues, executes heavy batch tasks in the background, and isolates failures so one bad file never halts execution.
* [`python/tests/test_allocation_engine.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/tests/test_allocation_engine.py)  
  * **What it does:** Unit tests for allocation constraints, handling uneven rosters, edge cases, and verifying that repeat coordinator pairings are rejected.
* [`python/tests/test_certificate_validator.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/tests/test_certificate_validator.py)  
  * **What it does:** Unit tests for certificate rules, corrupt PDF handling, date parsing, and placeholder detection.

---

### B. TypeScript (`src/`)

#### Why TypeScript?
* **Type Safety:** Guarantees compile-time checks, eliminating runtime `undefined` or null-pointer crashes.
* **Database Integration:** Pairs natively with `@supabase/supabase-js` for clean query definitions.
* **Reliable Business Logic:** Strict interfaces ensure models and audit loggers adhere strictly to database constraints.

#### Files & Descriptions
* [`src/index.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/index.ts)  
  * **What it does:** Standalone application entrypoint exporting core types, configuration, Supabase repository, and allocation models.
* [`src/config.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/config.ts)  
  * **What it does:** Validates and exposes Supabase environment variables with safe server-side checks.
* [`src/types/index.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/types/index.ts)  
  * **What it does:** Centralized TypeScript interfaces for Members, Events, Coordinator Assignments, and Audit Logs.
* [`src/allocation/engine.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/allocation/engine.ts)  
  * **What it does:** Node/TypeScript implementation of the coordinator allocation algorithm for use directly inside TypeScript pipelines.
* [`src/allocation/types.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/allocation/types.ts)  
  * **What it does:** Type definitions specifically for candidate pools, allocation constraints, and assignment results.
* [`src/supabase/client.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/supabase/client.ts)  
  * **What it does:** Database client wrapper handling queries, batch upserts, and connection pooling for Supabase PostgreSQL (includes Live and InMemory mock repositories).
* [`src/services/auditLogger.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/services/auditLogger.ts)  
  * **What it does:** Persists audit trails and operational activity logs to Supabase for transparency.
* [`vercel.json`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/vercel.json)  
  * **What it does:** Vercel deployment configuration managing routing and clean static delivery of the web application.
* [`api/health.js`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/api/health.js)  
  * **What it does:** Lightweight health check API endpoint for Vercel deployment verification.

---

### C. SQL (`supabase/`)

#### Why SQL (PostgreSQL)?
* **Relational Integrity:** Ensures members, events, and assignments remain strictly linked via foreign keys and cascade rules.
* **ACID Guarantees:** Prevents duplicate assignments or partial writes during high-concurrency operations.
* **Row-Level Security (RLS):** Secures data at the database layer based on user roles and permissions.

#### Files & Descriptions
* [`supabase/schema.sql`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/supabase/schema.sql)  
  * **What it does:** Complete database schema script defining tables (`members`, `events`, `assignments`, `audit_logs`), custom ENUM types, unique constraints, foreign keys, update triggers, and Supabase RLS security policies.

---

### D. Frontend Web Dashboard (`public/`)

#### Why Vanilla HTML5, CSS3 & JavaScript?
* **Zero Build Step:** Runs immediately in any browser without needing heavy build tools (Webpack/Vite), dependencies, or compilation steps.
* **Instant Cloud CDN Delivery:** Deploys instantly to Vercel with zero cold-starts.
* **Custom Dark Theme Styling:** Complete control over custom dark aesthetics and responsive layouts.

#### Files & Descriptions
* [`public/index.html`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/public/index.html)  
  * **What it does:** Single-page dashboard containing tabs for Overview, Bulk Certificate Validator, Coordinator Allocation Studio, Events Directory, and Members Directory.
* [`public/css/styles.css`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/public/css/styles.css)  
  * **What it does:** Premium dark-theme stylesheet implementing custom color tokens, glassmorphic cards, smooth transitions, badges, and responsive grids.
* [`public/js/app.js`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/public/js/app.js)  
  * **What it does:** Frontend application controller. Manages tab navigation, file drag-and-drop, validation progress animations, modal inspectors, and CSV export.
* [`public/js/mockData.js`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/public/js/mockData.js)  
  * **What it does:** Realistic mock dataset (members, events, assignments, certificate results) allowing complete offline testing and demonstration of all UI flows.

---

## 🎯 Quick Reference Summary

| Layer | Language | Key Files | Primary Role |
| :--- | :--- | :--- | :--- |
| **Documentation** | Markdown (`.md`) | `README.md`, `CSI_Club_Operations_Platform_Spec/*.md` | System specifications, business rules, architecture, guides |
| **Document & Allocation Engine** | Python | `python/certificate_validator.py`, `python/allocation_engine.py` | PDF parsing, OCR checks, scoring logic, constraint satisfaction |
| **Database & Service Layer** | TypeScript | `src/supabase/client.ts`, `src/allocation/engine.ts` | Type-safe Supabase connection, audit logging, and allocation |
| **Persistent Storage & Security** | SQL (PostgreSQL) | `supabase/schema.sql` | Relational tables, foreign keys, audit logs, RLS policies |
| **Interactive Dashboard** | HTML / CSS / JS | `public/index.html`, `public/js/app.js` | Zero-build visual dashboard for operating the club platform |
