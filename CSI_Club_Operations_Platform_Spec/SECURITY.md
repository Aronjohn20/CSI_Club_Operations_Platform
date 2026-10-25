# Security Requirements

## Authentication

Use a proper authentication mechanism.
Do not build password storage manually unless there is a strong reason.

## Authorization

Enforce authorization on the backend.

Examples:
- only authorized users can run allocation;
- only authorized users can upload certificate batches;
- only admins can configure certificate templates;
- only authorized users can manage Notion connections.

## Secrets

Never commit:
- database passwords;
- Notion secrets;
- JWT signing secrets;
- object storage credentials;
- API keys.

Use environment variables/secret management.

## File uploads

Validate:
- file type;
- file size;
- file count;
- file name;
- content where possible.

Do not trust browser-provided MIME type alone.

Store uploads outside the application source tree.

## Data access

Users should only see data they are authorized to access.

## Audit

Log security-relevant actions without logging secrets or sensitive credential material.

## Dependency security

Keep dependencies pinned/managed and run security checks as part of CI where practical.
