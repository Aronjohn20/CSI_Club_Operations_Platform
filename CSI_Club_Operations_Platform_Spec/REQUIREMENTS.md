# Functional Requirements

## FR-01 Authentication and access

The application must support authenticated access.

Minimum roles should be configurable, with a likely starting model:
- Admin/Operations Lead
- Editor/Operations Associate
- Read-only viewer

Do not hardcode authorization only in the frontend.

## FR-02 Dashboard

Show operationally useful information:
- upcoming/recent events;
- current coordinator allocation status;
- active allocation cycle;
- recent certificate batches;
- certificate failure count;
- Notion sync status;
- recent errors/actions where useful.

The dashboard should not become a KPI-heavy analytics page.

## FR-03 Members

Support:
- create;
- view;
- edit;
- activate/deactivate;
- search/filter;
- membership year;
- coordinator history;
- relevant Notion identifier.

The data model must support identifying whether a member is new/old according to the club rules.

## FR-04 Events

Support:
- create event;
- event date/status;
- coordinator requirement;
- allocation;
- mark event completed;
- view assigned coordinators;
- allocation history.

## FR-05 Coordinator allocation

Inputs:
- event;
- number of coordinators required;
- current member pool;
- club business rules.

Outputs:
- proposed coordinator group;
- explanation of important constraints satisfied;
- history-aware allocation.

The engine must reject impossible requests rather than producing an invalid assignment.

## FR-06 Certificate batches

Allow a user to:
- create a batch;
- upload up to 400 certificates;
- see upload progress;
- see processing progress;
- continue using the application while processing;
- view batch summary;
- filter passed/failed;
- inspect a certificate;
- see failed rules;
- retry failed processing when appropriate;
- export results.

Supported file types should be explicitly configured. PDF should be supported if that is the selected certificate format.

## FR-07 Certificate rules

Rules must be configurable per certificate template/version.

Rules may include:
- required text;
- text presence;
- text formatting;
- bold requirement;
- font requirement;
- approximate/exact line count;
- required date;
- required logo;
- placement/position constraints;
- required fields;
- prohibited/missing content.

Do not hardcode every rule into the UI.

## FR-08 Notion

Support:
- connect/configure Notion integration;
- map Notion databases to application entities;
- initial import;
- manual sync;
- automatic sync where supported;
- push application changes;
- sync status;
- error reporting;
- conflict handling.

## FR-09 Auditability

Record important operations:
- who created/changed an event;
- who ran an allocation;
- what allocation rules/version were used;
- who uploaded a certificate batch;
- validation result;
- Notion synchronization result.

## FR-10 Reliability

A single failed certificate, failed Notion page, or failed external API request must not unnecessarily bring down the entire application.

Use retries with sensible limits and idempotent operations where appropriate.
