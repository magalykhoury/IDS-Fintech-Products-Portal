# Local Demo Runbook

This runbook is the rehearsal script for the local instructor demonstration.

## Current verified status

The documented local demo was verified on 8 September 2026:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5242`
- Primary branch: `main`
- GitHub source: `https://github.com/magalykhoury/IDS-Fintech-Products-Portal`
- Admin `/users` access passed.
- Viewer login passed; viewer `/users` and product write actions were blocked.
- API unauthorized POST, PUT, and DELETE checks returned HTTP 403.

Keep passwords private and outside the repository.

## A. Before the Demo

- [ ] Laptop is connected to power.
- [ ] SQL Server service is running.
- [ ] `IdsFintechPortal` exists and contains the intended demo data.
- [ ] Local API user-secrets are present: database connection string and JWT key.
- [ ] Backend build has passed.
- [ ] Frontend lint and production build have passed.
- [ ] Browser is ready with unrelated tabs closed.
- [ ] Browser autofill is cleared or a clean/private profile is being used.
- [ ] Private demo credentials are available separately; do not display them during the presentation.
- [ ] Unrelated applications and notifications are closed or muted.

## B. Exact Startup

Open two PowerShell windows from the repository root.

### PowerShell window 1: backend

```powershell
cd backend\IdsFintechPortal.Api
dotnet run --launch-profile http
```

Expected API URL: `http://localhost:5242`

### PowerShell window 2: frontend

```powershell
cd frontend
npm run dev -- --host localhost --port 5173 --strictPort
```

Expected frontend URL: `http://localhost:5173`

Open `http://localhost:5173/login`. Log in with the private synthetic demo account selected for the scenario.

## C. Emergency Recovery

### Port 5173 is occupied

Use `Get-NetTCPConnection -LocalPort 5173`, stop only the stale Vite process, and restart the documented frontend command.

### Port 5242 is occupied

Use `Get-NetTCPConnection -LocalPort 5242`, stop only the stale API process, and restart `dotnet run --launch-profile http`.

### SQL Server service is stopped

Check `Get-Service MSSQLSERVER`. From an elevated PowerShell window, run `Start-Service MSSQLSERVER`, then confirm the database exists.

### API cannot connect to SQL Server

1. Confirm SQL Server is running and `IdsFintechPortal` exists.
2. Check the local secret names without displaying their values: `dotnet user-secrets list`.
3. Confirm the connection targets the local SQL Server instance and uses the intended authentication mode.
4. Restart the API.

### JWT secret is missing

```powershell
dotnet user-secrets set "Jwt:Key" "<private local signing key>"
```

Restart the API. Never place the real value in this runbook or a submission transcript.

### Login fails

Confirm the API is running at `http://localhost:5242`, the browser is exactly `http://localhost:5173` (not `127.0.0.1`), the account is active, and the private password is entered exactly.

### CORS error

Use the documented `localhost` hostname for both browser and frontend. The API allows that origin intentionally.

### Frontend fails to load or packages are missing

```powershell
cd frontend
npm install
npm run dev -- --host localhost --port 5173 --strictPort
```

If PowerShell reports that `npm.ps1` is blocked by execution policy, use
`npm.cmd install` and `npm.cmd run dev -- --host localhost --port 5173
--strictPort` instead.

## D. Rehearsed 8–12 Minute Demo

Use `demo.admin` for the main story and `demo.viewer` for the RBAC comparison. Keep the private credentials off-screen.

### 0:00–0:45 — Login and purpose

Open the login screen, sign in, and explain that this is a role-aware local portal for product delivery visibility.

### 0:45–2:00 — Dashboard

Show summary cards and lifecycle distributions. Explain that they are connected to relational product, client, deployment, environment, and responsibility data.

### 2:00–3:30 — Product relationships

Open `Atlas Payments Platform`. Show its status, criticality, technologies, modules, repository/documentation links, responsibilities, and related deployments.

### 3:30–4:30 — Client

Open `Cedar Ridge Bank`. Show its products and deployments, explaining that the client view provides delivery context without duplicating the product model.

### 4:30–6:00 — Deployment and environment

Open the Atlas production deployment. Show its environment, servers, modules, responsibilities, and status. Briefly show UAT or Testing to demonstrate delivery stages.

### 6:00–7:00 — Search and filters

Filter products or deployments by Atlas, Northstar, or Meridian, then by status, criticality, or client. Explain that the dataset is compact but intentionally relational.

### 7:00–8:00 — RBAC

Log out and sign in as `demo.viewer`. Show reduced actions/navigation and explain that authorization is enforced by role, not only by hiding buttons. Return to admin if needed.

### 8:00–9:30 — Approvals and notifications

If stable, show the pending deployment approval and unread in-app notification. Explain requester/reviewer separation and the event notification. Do not depend on an external provider.

### 9:30–10:30 — Architecture and close

Summarize React, the .NET 10 REST API, Dapper, and SQL Server created directly from SQL scripts. Mention that the database can be restored or rebuilt reproducibly.

If a page is slow or unavailable, skip it and continue the story. Do not attempt live AI configuration during the presentation.
