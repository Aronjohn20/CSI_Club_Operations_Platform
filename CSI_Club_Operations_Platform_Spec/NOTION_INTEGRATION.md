# Notion Integration

## Goal

Synchronize club operational data between the application and Notion.

## Expected entities

At minimum, consider:
- Members
- Events
- Coordinator assignments

Additional databases can be added later.

## Authentication

Use a secure server-side Notion integration credential.

Never expose the Notion secret in browser/client code.

## Mapping

Maintain explicit mappings:

```text
Application entity <-> Notion database
Application field  <-> Notion property
Application ID     <-> external Notion page ID
```

Do not rely on page titles as unique identifiers.

## Initial synchronization

Provide a controlled first-time import:
1. connect;
2. inspect available database;
3. map fields;
4. preview records;
5. import;
6. show results.

## Ongoing synchronization

Support:
- manual sync;
- background sync where appropriate;
- push application changes;
- pull Notion changes;
- sync status.

## Conflict handling

Do not silently overwrite conflicting edits.

The final policy is defined by `BUSINESS_RULES.md`.

Possible policies:
- Notion wins;
- application wins;
- latest update wins;
- field-level ownership;
- manual resolution.

## Reliability

Handle:
- rate limits;
- temporary network failures;
- missing/deleted Notion pages;
- changed Notion properties;
- invalid property values;
- partial sync failures.

Use retry/backoff where appropriate.

## Audit

Every sync job should expose:
- started;
- completed;
- failed;
- number read;
- number written;
- conflicts;
- errors.

## Security

Only authorized application roles should be able to trigger or configure synchronization.
