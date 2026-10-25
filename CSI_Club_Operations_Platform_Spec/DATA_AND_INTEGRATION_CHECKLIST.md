# Owner Setup Checklist

## Database

- [ ] PostgreSQL created
- [ ] database credentials created
- [ ] connection string available securely
- [ ] migrations reviewed
- [ ] backup policy decided

## Object storage

- [ ] bucket created
- [ ] access policy configured
- [ ] credentials stored securely
- [ ] file retention decided

## Queue

- [ ] Redis/queue service created if required
- [ ] worker connection configured

## Notion

- [ ] Notion integration created
- [ ] integration shared with required databases
- [ ] database IDs identified
- [ ] properties documented
- [ ] secret stored securely
- [ ] sync/conflict policy approved

## Certificate samples

Provide:
- [ ] valid certificate examples
- [ ] intentionally invalid examples
- [ ] all certificate templates
- [ ] rule list
- [ ] expected result for each sample

## Coordinator samples

Provide at least 5-10 realistic examples:
- member pool;
- event;
- number of coordinators;
- expected valid assignment;
- invalid assignment examples;
- previous assignment history.

These examples become acceptance tests.
