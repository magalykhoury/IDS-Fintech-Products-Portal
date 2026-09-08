# Submission Checklist

## Current status

Updated 8 September 2026. The source has been committed to `main` and pushed
to the public GitHub repository. The private database backup is intentionally
excluded from GitHub. ZIP packaging has not yet been created.

## Source

- [x] Correct source files are present.
- [x] `frontend/node_modules/`, `frontend/dist/`, backend `bin/`, and backend `obj/` are excluded.
- [x] No local environment or user-secret files are included.
- [x] No Playwright credential artifacts, screenshots, traces, videos, or reports are included.
- [x] Development-only `AGENTS.md` and `SESSION_HANDOFF.md` files are excluded from the public package.

## Database

- [x] Clean private `IdsFintechPortal-demo.bak` backup exists.
- [x] Backup restore was tested as a separate database.
- [x] `database/schema.sql` is complete and contains no data or secrets.
- [x] `database/seed-demo.sql` contains only synthetic demonstration data.
- [x] Phase 2 historical scripts are retained and documented.

## Documentation

- [x] `README.md` is concise and current.
- [x] `DEMO-RUNBOOK.md` has been rehearsed.
- [x] `DATABASE-HANDOFF.md` has been reviewed.
- [x] No internal planning material is in the public package.

## Verification

- [x] Backend `dotnet build` passes.
- [x] Frontend `npm run lint` passes.
- [x] Frontend `npm run build` passes.
- [x] Login and logout work.
- [x] Dashboard, product, client, deployment, and environment views work.
- [x] Relationships, search, and filters work.
- [x] RBAC was checked with admin and viewer accounts.
- [x] Approvals and notifications were checked.
- [x] Desktop and 390px mobile browser verification passed.
- [x] No unexpected console errors or horizontal overflow remain.

## Package

- [ ] ZIP was inspected manually before sharing.
- [ ] ZIP contains no secrets, local configuration, generated output, or QA artifacts.
- [ ] Private database backup is included only in the private instructor handoff.
- [x] Public GitHub source excludes `.bak`, database files, user secrets, and local artifacts.
- [ ] The final package opens cleanly on a separate machine using the README instructions.
