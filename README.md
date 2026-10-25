# CSI Club Operations Platform

A complete, production-grade operations management platform built for the **Computer Society of India (CSI) Student Branch**.

Complies with all technical and architectural specifications defined in the specification repository (`CERTIFICATE_VALIDATION.md`, `COORDINATOR_ENGINE.md`, `NOTION_INTEGRATION.md`, `UI_UX_SPEC.md`, `DATABASE_SPEC.md`, and `BUSINESS_RULES.md`).

---

## 🚀 Platform Architecture & Capabilities

```text
                                  ┌──────────────────────────────┐
                                  │   CSI Operations Web UI      │
                                  │   (HTML5, CSS3, JS Vanilla)  │
                                  └──────────────┬───────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   │                                                           │
                   ▼                                                           ▼
    ┌─────────────────────────────┐                             ┌─────────────────────────────┐
    │  Notion Integration Engine  │                             │  Python Async Engine        │
    │  (TypeScript / Node.js)     │                             │  (FastAPI, PyPDF, Worker)   │
    └──────────────┬──────────────┘                             └──────────────┬──────────────┘
                   │                                                           │
                   ├─────────────────────────────┬─────────────────────────────┤
                   ▼                             ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
        │  Notion Databases   │       │  Supabase Database  │       │  Bulk Certificates │
        │  (API v2 / Pages)   │       │  (PostgreSQL + RLS) │       │  (Up to 400 PDFs)   │
        └─────────────────────┘       └─────────────────────┘       └─────────────────────┘
```

---

## 🌟 Modules Built

### 1. Web User Interface (`public/`)
* **Design Identity**: Custom dark near-black/navy base (`#090a12`, `#101222`), deep purple & dark-blue ambient glow, and restrained magenta accents (`#d946ef`).
* **Overview Dashboard**: Active cycle indicators, coordinator counts, upcoming events, and Notion sync status.
* **Bulk Certificate Validator**:
  * Drag-and-drop zone capable of accepting up to 400 certificate files.
  * Real-time async progress tracking (`247 / 400 processed`, pass/fail counters).
  * Filterable results table (All, Passed, Failed Rules).
  * Detailed rule inspector modal explaining *why* a certificate passed or failed (expected vs. actual).
  * 1-click CSV export of batch validation results.
* **Coordinator Allocation Studio**:
  * Target event selector and coordinator count configuration.
  * Deterministic constraint solver enforcing 1 New + 1 Old coordinator balance, pair history uniqueness, and workload distribution.
  * Satisfied constraint chips (`1 New + 1 Old Composition ✓`, `No Previous Pairing ✓`, `Workload Balanced ✓`).
* **Members & Events Directories**: Complete operational listings with classification badges and active toggles.
* **Notion Sync Control Center**: Real-time sync logs, connection indicator, and 1-click Pull / Push / Bidirectional synchronization with live conflict resolver inspection.

### 2. Python Backend & PDF Pipeline (`python/`)
* **[`certificate_validator.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/certificate_validator.py)**:
  * Pluggable rule-based certificate engine.
  * Validates required text phrases, forbidden placeholder text, issuance date patterns, write-up word counts, and logo presence with confidence scores.
  * SHA-256 checksum generation for duplicate detection.
  * Failure isolation: an unreadable or corrupt PDF is marked as `FAILED`/`ERROR` without crashing the batch.
* **[`allocation_engine.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/allocation_engine.py)**:
  * Deterministic constraint satisfaction engine for coordinator allocation.
  * Guarantees 1 New + 1 Old composition, skips unavailable/excluded members, balances lifetime workload, and prevents repeated pairings.
* **[`worker.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/worker.py)**:
  * Asynchronous batch worker using thread pool execution for high-throughput validation of up to 400 certificates without blocking the server.
* **[`server.py`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/python/server.py)**:
  * FastAPI REST API serving endpoints for batch upload, background progress polling, CSV export, and allocation execution.

### 3. Notion & Supabase Engine (`src/`)
* **[`notionSyncService.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/services/notionSyncService.ts)**:
  * Full two-way synchronization between Notion and Supabase.
  * Controlled first-time import with schema inspection and dry-run preview.
* **[`client.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/notion/client.ts)**:
  * Resilient Notion API client with built-in rate-limiting (~2.5 req/s) and exponential backoff retry on HTTP 429 and 5xx errors.
* **[`conflictResolver.ts`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/src/services/conflictResolver.ts)**:
  * Configurable strategies: `latest_wins`, `notion_wins`, `app_wins`, or `manual`.
* **[`supabase/schema.sql`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/supabase/schema.sql)**:
  * Complete PostgreSQL schema for `members`, `events`, `coordinator_assignments`, `allocation_runs`, `notion_sync_jobs`, and `audit_logs` with triggers and indexes.

---

## 🏃 Running the Application

### 1. View the Web Interface
Simply open [`public/index.html`](file:///r:/VSCODE/CSI_Club_Operations_Platform_Spec/public/index.html) in any modern browser, or serve it with any local static file server:
```bash
# Optional: Using Python built-in static server
python -m http.server 3000 --directory public
```
Navigate to `http://localhost:3000` to interact with the full dashboard, simulate the 400-certificate validation pipeline, run coordinator allocations, and inspect the Notion sync center.

### 2. Run the Python Backend & PDF Engine
```bash
cd python
pip install -r requirements.txt
python server.py
```
* API runs on `http://localhost:8000`.
* Interactive API documentation: `http://localhost:8000/docs`.

### 3. Run the Notion Synchronization CLI
```bash
# Install dependencies
npm install

# Run offline unit tests
npm test

# Run sync commands (configure .env when credentials are ready)
npm run sync:inspect       # Inspect Notion database schemas
npm run sync:preview       # Dry-run preview of records
npm run sync:pull          # Ingest Notion records into Supabase
npm run sync:push          # Push local assignments to Notion
npm run sync:bidirectional # Full two-way sync
```
