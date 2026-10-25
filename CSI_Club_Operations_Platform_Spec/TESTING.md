# Testing Strategy

## Unit tests

Required for:
- certificate rule evaluation;
- line counting logic;
- formatting detection;
- coordinator constraints;
- pair history;
- workload balancing;
- reset/cycle logic;
- Notion field mapping.

## Integration tests

Test:
- API + database;
- certificate batch creation;
- queue/worker processing;
- object storage;
- Notion adapter.

## End-to-end tests

Important flows:
1. Login
2. Create event
3. Generate coordinator allocation
4. Confirm allocation
5. Complete event
6. Start next cycle
7. Upload a certificate batch
8. Process 400 certificates
9. Inspect failed certificates
10. Export results
11. Synchronize with Notion

## Edge cases

Test:
- 0 files;
- 1 file;
- 400 files;
- 401 files;
- corrupt file;
- unsupported file;
- duplicate file;
- partial worker failure;
- browser refresh during processing;
- Notion API rate limit;
- Notion record deleted externally;
- no valid coordinator combination.

## UI quality

Verify:
- responsive behavior;
- keyboard navigation;
- focus states;
- loading states;
- empty states;
- errors;
- accessibility;
- long filenames;
- large result sets.
