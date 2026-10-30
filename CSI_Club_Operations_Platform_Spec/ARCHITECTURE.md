# Architecture

## Recommended architecture

Use a modular full-stack architecture.

### Recommended default stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS or an equivalent design-system approach

Backend:
- Python
- FastAPI

Database:
- PostgreSQL

Background processing:
- Redis + Celery/RQ or an equivalent durable job system

Object storage:
- S3-compatible storage for uploaded certificate files

External integration:
- Notion API

Deployment:
- containerized services;
- frontend/backend/worker separated logically;
- managed PostgreSQL and object storage where practical.

The exact providers may be chosen later.

## Logical architecture

```text
Browser
   |
   v
Web UI
   |
   v
API
   |
   +--> PostgreSQL
   |
   +--> Object Storage
   |
   +--> Job Queue --> Certificate Workers
   |
   +--> Notion Integration
```

## Important principle

Do not process a 400-file certificate batch synchronously inside a single request.

The request should:
1. validate the batch;
2. create a batch record;
3. create file records;
4. enqueue jobs;
5. return a batch ID.

Workers then process individual files.

## Module boundaries

### Identity
Authentication and authorization.

### Members
Member lifecycle and member metadata.

### Events
Event lifecycle.

### Allocation
Constraint-based coordinator selection.

### Certificates
Batch upload, file storage, validation, results.

### Notion
External API adapter and synchronization.

### Audit
Important system actions.

## Failure isolation

The system should tolerate:
- one malformed certificate;
- one corrupt PDF;
- one failed Notion request;
- temporary object storage failure;
- temporary queue failure;
- browser refresh during processing.

## Idempotency

Retries must not:
- duplicate assignments;
- duplicate Notion records;
- duplicate certificate results;
- create duplicate audit records unnecessarily.

Use stable IDs and idempotency keys where needed.
