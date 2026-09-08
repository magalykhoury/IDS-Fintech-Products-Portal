# IDS Fintech Products Portal

## Overview

IDS Fintech Products Portal is a local product and delivery management portal for tracking fintech products, clients, deployments, environments, technical assets, responsibilities, and approval activity.

The project is designed for a reliable local demonstration. It is not intended to be hosted as part of this submission.

## Current Delivery Status

As of 8 September 2026, the local demo and database handoff have been verified.

- Backend: `http://localhost:5242`
- Frontend: `http://localhost:5173`
- Git branch: `main`
- GitHub: [magalykhoury/IDS-Fintech-Products-Portal](https://github.com/magalykhoury/IDS-Fintech-Products-Portal)
- Initial release-candidate commit: `d457d25`
- Working tree: clean
- Database backup: private `IdsFintechPortal-demo.bak`, excluded from GitHub
- Demo accounts: `demo.admin`, `demo.viewer`, `demo.manager`, `demo.implementation`, and `demo.developer`

The final RBAC smoke test confirmed that `demo.admin` can access `/users`, `demo.viewer` can log in but cannot access `/users` or write product data, and the API returns HTTP 403 for unauthorized POST, PUT, and DELETE requests.

## Key Features

### MVP

- Authentication with JWT and role-based access control
- Product, client, deployment, and environment management
- Servers, technologies, modules, repositories, and documents
- Team members and product/deployment responsibilities
- Dashboard summaries and lifecycle distributions
- Search, filtering, detail views, and relationship navigation

### Phase 2

- Deployment approval workflows
- Reusable in-app notifications and event notifications
- Optional Portal Intelligence capability when configured and available

The core portal does not depend on an external AI service.

## Architecture

```text
React + TypeScript
        |
ASP.NET Core .NET 10 Web API
        |
      Dapper
        |
     SQL Server
```

## Tech Stack

- React and TypeScript
- Vite
- ASP.NET Core .NET 10 Web API
- Dapper
- SQL Server
- JWT authentication and RBAC
- BCrypt password hashing
- Playwright/manual browser verification

## Prerequisites

- Windows with SQL Server or SQL Server Express/Developer
- .NET SDK 10.0 or later
- Node.js and npm (Node.js 20 LTS or later recommended)
- A modern browser

Confirm the installed tools before the demo:

```powershell
dotnet --version
node --version
npm --version
```

## Database Setup

The instructor-approved database workflow uses a database created directly in SQL Server. EF Core migrations are not used.

### Option A: restore the private backup

Use `database/IdsFintechPortal-demo.bak` for the private instructor handoff. Restore it as `IdsFintechPortal` using SQL Server Management Studio or `sqlcmd`. Do not commit the backup to GitHub.

### Option B: rebuild from scripts

From the repository root:

```powershell
sqlcmd -S . -d master -E -C -b -Q "IF DB_ID(N'IdsFintechPortal') IS NULL CREATE DATABASE [IdsFintechPortal]"
sqlcmd -S . -d master -E -C -b -Q ":r database\schema.sql" -v DatabaseName=IdsFintechPortal
sqlcmd -S . -d master -E -C -b -Q ":r database\seed-demo.sql" -v DatabaseName=IdsFintechPortal
```

See [DATABASE-HANDOFF.md](DATABASE-HANDOFF.md) for restore verification and troubleshooting.

## Backend Setup

The API expects local configuration values for the SQL connection string and JWT signing key. Keep these values in .NET user-secrets or environment variables; never commit them.

From `backend/IdsFintechPortal.Api`:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<local SQL Server connection string>"
dotnet user-secrets set "Jwt:Key" "<local development signing key>"
dotnet restore
dotnet build
```

The API HTTP profile listens on `http://localhost:5242`.

## Frontend Setup

From `frontend`:

```powershell
npm install
npm run dev -- --host localhost --port 5173 --strictPort
```

The optional local `.env.local` file may define `VITE_API_BASE_URL=http://localhost:5242/api`. Do not commit `.env.local` or any secret-bearing environment file.

On Windows PowerShell, use the equivalent `npm.cmd` command if the local execution policy blocks `npm.ps1`.

## Running the Application

Start the backend in one PowerShell window:

```powershell
cd backend\IdsFintechPortal.Api
dotnet run --launch-profile http
```

Start the frontend in a second PowerShell window:

```powershell
cd frontend
npm run dev -- --host localhost --port 5173 --strictPort
```

Open [http://localhost:5173/login](http://localhost:5173/login). Use the private local demo credentials kept separately by the project owner; passwords are intentionally not published in this README.

For the exact rehearsal and recovery procedure, see [DEMO-RUNBOOK.md](DEMO-RUNBOOK.md).

## Security

- JWT signing keys are stored in local user-secrets or environment variables.
- SQL connection strings are stored in local user-secrets or environment variables.
- Optional OpenAI configuration is never committed.
- Demo accounts use synthetic data and BCrypt password hashes.
- Backups, database files, local environment files, logs, and browser artifacts are excluded from public source control.

## Testing

Backend:

```powershell
cd backend\IdsFintechPortal.Api
dotnet build
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

The final verification also includes authenticated browser checks for login/logout, dashboard, CRUD/detail views, relationships, filters, RBAC, approvals, notifications, desktop layout, and a 390px mobile viewport.

## Project Structure

```text
backend/IdsFintechPortal.Api/   ASP.NET Core API, Dapper data access, auth, and services
frontend/                       React/Vite client
database/schema.sql             Complete current schema, including Phase 2 tables
database/seed-demo.sql          Synthetic, repeatable demonstration data
database/phase2-*.sql           Historical additive Phase 2 scripts
DEMO-RUNBOOK.md                 Local launch, recovery, and presentation steps
DATABASE-HANDOFF.md             Database restore and rebuild instructions
SUBMISSION-CHECKLIST.md         Final packaging and verification checklist
```

## Demo / Submission Notes

This project is demonstrated locally through the React development server and the .NET API. No hosting, PWA packaging, desktop wrapper, native mobile project, or cloud deployment is required.

The instructor submission should contain the source and documentation. The SQL Server backup is a private handoff artifact and must remain outside GitHub. Development-only instruction and session files are excluded from the public submission.

The public GitHub repository contains the source, safe SQL scripts, documentation, configuration examples, package-lock files, and design assets. It does not contain database backups, local secrets, user-secrets, build output, dependencies, or browser-test artifacts.
