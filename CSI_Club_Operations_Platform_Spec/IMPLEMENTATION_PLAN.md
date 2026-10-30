# Implementation Plan: CSI Club Operations Platform (Standalone Architecture)

This document tracks the phased development of the **CSI Club Operations Platform**, running as a **100% standalone, self-contained system** deployed on **Vercel** with **Supabase PostgreSQL** and the **Python Engine**.

> [!NOTE]
> **Architecture Decision:** Notion integration has been completely decommissioned and removed because the student coordinators do not have Workspace Owner permissions in Notion. The platform now operates entirely independently with its own database and operational directories.

---

## 📋 Status Overview

- [x] **Phase 0:** Requirements & Standalone Architecture Freeze
- [x] **Phase 1:** Foundation & UI Design System
- [x] **Phase 2:** Directory & Classification Data Models
- [x] **Phase 3:** Coordinator Allocation Engine
- [x] **Phase 4:** Certificate Validation Pipeline
- [ ] **Phase 5:** Vercel Cloud Deployment & Member Onboarding (👉 **CURRENT NEXT STEP**)
- [ ] **Phase 6:** Live Term Operations & Coordinator Allocation Run

---

## Phase 0 — Requirements & Standalone Architecture Freeze ✅

* [x] Defined core domain and constraint rules in `BUSINESS_RULES.md`.
* [x] Defined user roles:
  * **Admin / Operations Lead** (Manages platform, executes allocations).
  * **Editor / Operations Associate** (Operational inputs & reviews).
  * **Read-only Viewer** (General team access).
* [x] **Removed external Notion dependencies:** Platform is 100% self-reliant.
* [x] Adopted **zero-maintenance Vercel cloud deployment** for instant web access.

---

## Phase 1 — Foundation & UI Design System ✅

* [x] Custom dark-mode design system (`#090a12`, `#101222`, `#d946ef`).
* [x] Responsive navigation tabs: Overview, Certificate Pipeline, Allocation Studio, Events, and Members.
* [x] Standalone status pill, metric counters, and accessible inspector modals.
* [x] Database schema established in `supabase/schema.sql` (members, events, assignments, audit logs, RLS policies).

---

## Phase 2 — Members & Events Management ✅

* [x] Member directory with coordinator classifications (`executive`, `old_coordinator`, `new_coordinator`).
* [x] Event schedule tracker with lead/coordinator status tags.
* [x] Relational schema and Supabase queries.

---

## Phase 3 — Coordinator Allocation Engine ✅

* [x] Core constraint satisfaction solver (`python/allocation_engine.py` and `src/allocation/engine.ts`).
* [x] Enforces:
  * Exactly 1 New + 1 Old/Senior coordinator balance per pairing.
  * Rejects repeated historical pairings.
  * Workload balancing across candidate pool.
* [x] Interactive UI Studio with constraint satisfaction chips (`public/index.html` & `public/js/app.js`).
* [x] Automated unit test suite (`python/tests/test_allocation_engine.py`).

---

## Phase 4 — Certificate Validation Pipeline ✅

* [x] Rule-based PDF validator (`python/certificate_validator.py`):
  * Mandatory phrase matching.
  * Forbidden placeholder detection ("Lorem Ipsum", "Template").
  * Date extraction and format checks.
  * Word count verification.
  * CSI branch logo presence heuristic.
  * SHA-256 deduplication.
  * Batch failure isolation (one bad PDF won't crash the batch).
* [x] Bulk drag-and-drop uploader supporting up to 400 certificate files.
* [x] Pass/fail filterable table, rule inspector modal, and CSV export.
* [x] Automated unit test suite (`python/tests/test_certificate_validator.py`).

---

## Phase 5 — Vercel Cloud Deployment & Team Access (👉 Current Next Step)

* [ ] Push codebase to your GitHub repository.
* [ ] Connect repository to **Vercel** (`vercel.json` already configured for zero-config static UI).
* [ ] Add database variables in Vercel (optional if using Supabase):
  * `SUPABASE_URL`
  * `SUPABASE_ANON_KEY`
* [ ] Obtain live production URL (`https://your-app.vercel.app`).
* [ ] Send web link to your 4 team members so they can immediately access the dashboard without installing anything.

---

## Phase 6 — Live Term Operations & Verification

* [ ] Team members open the live link in their browsers.
* [ ] Run real coordinator allocations for upcoming college hackathons / workshops.
* [ ] Validate semester event certificate batches (up to 400 PDFs).
* [ ] Verify that members and coordinators can view their assignments and status.
