# UI / UX Specification

## Design direction

Build a polished dark interface inspired by the supplied CSI Student Branch website screenshot.

The UI should look like a product created specifically for CSI Student Branch, not a purchased admin template.

## Visual system

### Background

Use layered dark surfaces:
- near-black;
- deep navy;
- deep purple;
- subtle blue/purple gradients.

Do not use a bright purple background.

### Accents

Primary accent: magenta/purple.
Secondary accent: CSI-inspired dark/electric blue.

Accent usage should be restrained:
- primary actions;
- active navigation;
- focus states;
- progress;
- important highlights.

### Typography

Use a modern sans-serif.
Large headings should be bold and confident.
Body text should remain highly readable.

Avoid excessive uppercase text.

### Surfaces

Use:
- subtle borders;
- moderate corner radius;
- restrained glass/blur effects;
- clear elevation.

Do not turn every element into a floating glass card.

## Navigation

Suggested primary navigation:

- Overview
- Certificates
- Events
- Coordinators
- Members
- Notion Sync
- Settings

On smaller screens, collapse appropriately.

## Certificate experience

### Batch upload page

The main interaction should be obvious:

`Upload up to 400 certificates`

Show:
- drag/drop zone;
- file count;
- selected files;
- total size if relevant;
- template/rule-set selection;
- start validation button.

### Processing state

Show a real progress state:

`247 / 400 processed`

Also show:
- passed;
- failed;
- processing;
- errors.

Do not freeze the UI.

### Results

Provide:
- Pass/Fail filters;
- search by filename;
- sorting;
- failure reason;
- batch summary.

A user should be able to find all certificates with one particular rule failure quickly.

### Certificate detail

Show:
- certificate preview;
- filename;
- overall status;
- rules checked;
- passed rules;
- failed rules;
- error explanation;
- retry action where applicable.

## Coordinator experience

Make the allocation workflow visual:

1. Select event
2. Enter/confirm required coordinator count
3. Review constraints
4. Generate allocation
5. Review proposed group
6. Confirm
7. Mark event completed later

Show why an allocation is valid.

Example:
- `1 New + 1 Old ✓`
- `No previous pairing ✓`
- `Workload balanced ✓`

## Notion sync experience

Show synchronization as a system status, not a mysterious background process.

Display:
- Connected/Disconnected;
- last successful sync;
- records read;
- records written;
- conflicts;
- failed records;
- retry.

## States

Every important screen must have:
- loading;
- empty;
- success;
- partial success;
- error;
- permission denied;
- offline/network failure where relevant.

## Accessibility

- keyboard accessible;
- visible focus states;
- sufficient contrast;
- semantic controls;
- meaningful labels;
- do not rely only on color for pass/fail.

## Responsive behavior

The primary use case is desktop/laptop, but the application must remain usable on tablet and smaller screens.
