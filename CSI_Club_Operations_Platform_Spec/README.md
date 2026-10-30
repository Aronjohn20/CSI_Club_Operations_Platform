# CSI Club Operations Platform

A production-oriented internal web application for CSI Student Branch operations.

## Core modules

1. **Certificate Validation**
   - Bulk upload up to 400 certificates per batch.
   - Validate every certificate against configurable certificate rules.
   - Produce per-file pass/fail results and a batch-level summary.
   - Allow failed certificates to be inspected individually.
   - Export validation results.

2. **Coordinator Allocation**
   - Maintain the club member pool.
   - Allocate a configurable number of coordinators per event.
   - Enforce business rules supplied by the club.
   - Track allocation history and previous combinations.
   - Reset/advance the allocation cycle after events are completed.

3. **Notion Synchronization**
   - Connect the application to the club's Notion database(s).
   - Read member/event data from Notion.
   - Push approved changes from the application to Notion.
   - Keep synchronization status and errors visible.
   - Do not silently overwrite conflicting data.

## Product principle

This is an internal operations platform, not a generic admin template. The UI must feel like a polished CSI Student Branch product and visually follow the existing CSI website identity shown in the supplied reference screenshot.

## Source of truth

The following documents are the project specification. Antigravity should read `AGENTS.md` first, then the context and requirements files before implementing anything.

Business rules that depend on club policy are intentionally left for the project owner to fill in `BUSINESS_RULES.md`.
