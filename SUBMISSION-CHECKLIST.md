# Submission Checklist

## Source

- [ ] Correct source files are present.
- [ ] `frontend/node_modules/`, `frontend/dist/`, backend `bin/`, and backend `obj/` are excluded.
- [ ] No local environment or user-secret files are included.
- [ ] No Playwright credential artifacts, screenshots, traces, videos, or reports are included.
- [ ] Development-only `AGENTS.md` and `SESSION_HANDOFF.md` files are excluded from the public package.

## Database

- [ ] Clean private `IdsFintechPortal-demo.bak` backup exists.
- [ ] Backup restore was tested as a separate database.
- [ ] `database/schema.sql` is complete and contains no data or secrets.
- [ ] `database/seed-demo.sql` contains only synthetic demonstration data.
- [ ] Phase 2 historical scripts are retained and documented.

## Documentation

- [ ] `README.md` is concise and current.
- [ ] `DEMO-RUNBOOK.md` has been rehearsed.
- [ ] `DATABASE-HANDOFF.md` has been reviewed.
- [ ] No development-session transcripts or pasted planning material are in the public package.

## Verification

- [ ] Backend `dotnet build` passes.
- [ ] Frontend `npm run lint` passes.
- [ ] Frontend `npm run build` passes.
- [ ] Login and logout work.
- [ ] Dashboard, product, client, deployment, and environment views work.
- [ ] Relationships, search, and filters work.
- [ ] RBAC was checked with admin and viewer accounts.
- [ ] Approvals and notifications were checked if included in the demo.
- [ ] Desktop and 390px mobile browser verification passed.
- [ ] No unexpected console errors or horizontal overflow remain.

## Package

- [ ] ZIP was inspected manually before sharing.
- [ ] ZIP contains no secrets, local configuration, generated output, or QA artifacts.
- [ ] Private database backup is included only in the private instructor handoff.
- [ ] Public GitHub source excludes `.bak`, database files, user secrets, and local artifacts.
- [ ] The final package opens cleanly on a separate machine using the README instructions.
