# Project Context

## Organization

CSI Student Branch, Rajagiri School of Engineering & Technology.

The application is intended for internal club operations.

## Existing visual identity

The supplied reference screenshot shows:
- a black/dark navigation bar;
- very dark navy/purple page background;
- purple-to-dark-blue atmospheric gradient;
- white primary typography;
- magenta/purple accent;
- blue accent influenced by the CSI logo;
- rounded outlined controls;
- clean, premium, modern appearance.

Approximate visual palette from the reference:

- `#020105` — near-black
- `#0A041C` — primary dark background
- `#11103A` — dark blue
- `#251A53` — purple-blue
- `#35225F` — purple
- `#C02DAA` — magenta accent
- `#FFFFFF` — primary text
- `#B8B5C8` — secondary text

These are starting values, not a restriction. Preserve the overall visual character.

## Product goal

Reduce repetitive operational work for the club by centralizing:

- certificate quality checking;
- coordinator assignment;
- event/member records;
- synchronization with Notion.

## Important scale assumptions

- Current club size: approximately 23 members.
- Certificate batch size: up to 400 certificates.
- Coordinator count per event is configurable.
- The system should be designed so the member count can grow beyond 23 without redesigning the core logic.

## Product philosophy

The application should feel:
- fast;
- reliable;
- premium;
- simple enough for non-technical club members;
- powerful enough for the operations lead;
- transparent when an automated decision is made.

Avoid:
- excessive cards;
- unnecessary gradients everywhere;
- giant dashboard KPI walls;
- generic Bootstrap/admin-template appearance;
- confusing navigation;
- tiny text;
- decorative UI that does not help the workflow.
