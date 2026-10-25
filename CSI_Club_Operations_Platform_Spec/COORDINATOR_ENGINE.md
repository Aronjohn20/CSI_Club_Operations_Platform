# Coordinator Allocation Engine

## Goal

Generate valid coordinator groups for club events according to club-defined rules while considering previous assignments.

## Inputs

- active members;
- member classification;
- event;
- required coordinator count;
- availability;
- exclusions;
- allocation history;
- current allocation cycle;
- business-rule version.

## Hard constraints

These come from `BUSINESS_RULES.md` and must never be invented by the implementation.

Example:
- exactly N coordinators;
- required new/old composition;
- excluded members cannot be selected.

## Soft constraints

Potential examples:
- minimize repeated pairs;
- balance total workload;
- avoid repeatedly selecting the same member;
- prefer members who have coordinated less recently.

The owner must confirm which of these apply.

## Important behavior

If no valid group exists:
- do not produce an invalid group;
- explain why;
- show the closest useful diagnostic if possible;
- allow the user to modify inputs.

## Allocation transparency

Every generated allocation should store:
- allocation run ID;
- rule version;
- selected members;
- relevant constraint results;
- timestamp;
- actor.

## Reset/cycle

"Reset" should not delete historical data.

Instead, create a new allocation cycle or update the appropriate cycle state while retaining history.

The exact meaning must be finalized in `BUSINESS_RULES.md`.

## Testing

Create tests for:
- valid combinations;
- invalid combinations;
- insufficient new members;
- insufficient old members;
- repeated pair handling;
- workload balancing;
- exclusions;
- unavailable members;
- impossible requests;
- cycle reset behavior.
