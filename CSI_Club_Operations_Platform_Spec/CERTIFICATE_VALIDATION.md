# Certificate Validation Specification

## Goal

Validate up to 400 certificates in a single batch against a selected certificate template/rule set.

## Processing model

```text
Upload batch
   |
Create batch
   |
Create certificate file records
   |
Queue one job per file
   |
Worker extracts/reads document
   |
Run rules
   |
Persist rule results
   |
Update file status
   |
Update batch counters
```

## Required statuses

Batch:
- CREATED
- UPLOADING
- QUEUED
- PROCESSING
- COMPLETED
- PARTIAL_FAILURE
- FAILED
- CANCELLED

File:
- UPLOADING
- QUEUED
- PROCESSING
- PASSED
- FAILED
- ERROR

## Rule engine

Rules should be data/configuration driven.

Suggested rule categories:

### Content
- required phrase exists;
- required name exists;
- date exists;
- forbidden text does not exist.

### Formatting
- phrase is bold;
- font matches expected value;
- font size within range;
- text alignment;
- capitalization where required.

### Structure
- write-up line count;
- required sections;
- page count.

### Visual/layout
- logo exists;
- logo approximately within expected region;
- required element exists in expected area.

The final supported rule types depend on the actual certificate format and parser capabilities.

## Important limitation

Do not promise perfect visual/layout validation until the actual certificate format is tested.

If a rule cannot be reliably verified automatically, label it as:
- unsupported;
- needs manual review;
- or confidence-based.

Do not falsely report certainty.

## Batch requirements

- Maximum batch size: 400 files.
- Individual file failures must not stop other files.
- Allow retrying eligible failed files.
- Preserve the original uploaded file.
- Calculate a checksum to detect accidental duplicates if desired.
- Prevent duplicate processing when the same job is retried.

## Results

Each rule should produce:
- rule name;
- status;
- expected;
- actual/detected;
- explanation.

The UI should make the failure reason understandable to a non-technical club user.

## Export

Provide a machine-readable export such as CSV containing:
- filename;
- overall status;
- failed rule names;
- failure summary;
- processing timestamp.
