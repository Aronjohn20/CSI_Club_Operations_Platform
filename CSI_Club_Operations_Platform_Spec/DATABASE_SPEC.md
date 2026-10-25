# Database Specification

## Owner implementation note

The project owner will create/configure the database separately and then provide the required connection/configuration to the application.

Antigravity should implement migrations/schema code according to the approved design, but should not assume it can create production infrastructure or credentials.

## Suggested entities

### users
Application accounts and roles.

### members
Club member information.

Suggested fields:
- id
- name
- email (if required)
- join_year
- member_type/classification
- active
- notion_page_id
- created_at
- updated_at

### events
- id
- name
- event_date
- status
- required_coordinator_count
- notion_page_id
- created_at
- updated_at

### coordinator_assignments
- id
- event_id
- member_id
- allocation_run_id
- status
- created_at

### allocation_runs
Stores each generation/decision:
- id
- event_id
- rule_version
- input_snapshot/reference
- result
- created_at
- created_by

### allocation_cycles
Tracks the current cycle/reset state if the club rules require cycles.

### coordinator_pair_history
Optional derived/transactional structure to efficiently prevent repeated combinations.

### certificate_templates
- id
- name
- version
- active
- rules_definition
- created_at

### certificate_batches
- id
- template_id
- status
- total_files
- processed_files
- passed_files
- failed_files
- created_by
- created_at

### certificate_files
- id
- batch_id
- original_filename
- storage_key
- status
- error_message
- checksum
- created_at

### certificate_validation_results
- id
- certificate_file_id
- rule_id
- status
- actual_value
- expected_value
- details

### notion_sync_jobs
- id
- entity_type
- entity_id
- operation
- status
- external_id
- error
- attempts
- timestamps

### audit_logs
- id
- actor_id
- action
- entity_type
- entity_id
- metadata
- created_at

## Database principles

- Use UUIDs or another collision-safe identifier.
- Use foreign keys.
- Add indexes for frequent lookups.
- Add uniqueness constraints where duplication is invalid.
- Keep historical records rather than overwriting operational history.
- Store timestamps in UTC.
- Never store large binary certificate files directly in PostgreSQL unless there is a deliberate reason to do so; prefer object storage.
