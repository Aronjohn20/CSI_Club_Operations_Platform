# Deployment Requirements

## Local development

Provide:
- documented environment variables;
- local database option;
- local Redis/queue option;
- local object storage option or development bucket;
- one-command or clearly documented startup.

Docker Compose is recommended for local infrastructure where useful.

## Production

Production should have separate services/logical components for:
- web frontend;
- API;
- background worker;
- database;
- queue;
- object storage.

## Environment configuration

Maintain separate:
- development;
- staging (if used);
- production.

Never commit production secrets.

## CI/CD

Recommended pipeline:
1. install dependencies;
2. lint;
3. type-check;
4. unit tests;
5. integration tests where available;
6. build;
7. security checks;
8. deploy.

## Monitoring

Track:
- API errors;
- worker failures;
- certificate processing failures;
- queue backlog;
- Notion sync failures;
- database errors.

## Backups

Production database backups must be enabled.
Certificate storage must have an appropriate retention/backup policy.

## Production readiness checklist

- [ ] authentication enabled
- [ ] authorization tested
- [ ] database migrations verified
- [ ] secrets configured
- [ ] object storage configured
- [ ] background worker configured
- [ ] Notion integration configured
- [ ] logging enabled
- [ ] backups enabled
- [ ] health checks enabled
- [ ] error handling tested
- [ ] certificate 400-file test completed
