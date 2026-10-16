# IDS Fintech Products Portal

A local demonstration portal for products, clients, deployments, environments,
team responsibilities, approvals, and notifications. Built with React,
TypeScript, ASP.NET Core 10, Dapper, and SQL Server. Business records in the
demo seed are synthetic.

## Local setup

Install .NET 10, Node.js compatible with Vite 8, SQL Server, and `sqlcmd`.
Create an empty `IdsFintechPortal` database, then create its tables:

```powershell
sqlcmd -S . -E -C -b -i database/schema.sql -v DatabaseName=IdsFintechPortal
```

The seed requires five independently generated BCrypt password hashes supplied
locally. Generate a BCrypt hash (cost 12 recommended) for each private demo
password using a trusted local BCrypt tool. Do not use an online hash generator,
reuse a real password, or commit the values. Set these process environment
variables; `sqlcmd` reads them automatically:

```powershell
$env:DemoAdminPasswordHash = '<private BCrypt hash>'
$env:DemoDeveloperPasswordHash = '<private BCrypt hash>'
$env:DemoManagerPasswordHash = '<private BCrypt hash>'
$env:DemoImplementationPasswordHash = '<private BCrypt hash>'
$env:DemoViewerPasswordHash = '<private BCrypt hash>'
sqlcmd -S . -E -C -b -i database/seed-demo.sql -v DatabaseName=IdsFintechPortal
```

Seed usernames are `demo.admin`, `demo.developer`, `demo.manager`,
`demo.implementation`, and `demo.viewer`. Rerunning the seed preserves existing
account passwords. Rotate any existing demo password that was reused elsewhere;
old hashes are excluded from this repository's published history.

Configure backend secrets locally:

```powershell
cd backend/IdsFintechPortal.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<local SQL connection string>"
dotnet user-secrets set "Jwt:Key" "<unique random signing key of at least 32 characters>"
dotnet run --launch-profile http
```

In another terminal:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev -- --host localhost --port 5173 --strictPort
```

Open `http://localhost:5173`. The API runs at `http://localhost:5242`.
Optional API settings use server-side user-secrets or environment variables;
`OPENAI_API_KEY` must never be placed in frontend configuration. When enabled,
Portal Intelligence sends selected portal facts to the configured AI provider.

## Checks and security

Run `npm.cmd run build`, `npm.cmd run lint`, and `npm.cmd audit` in `frontend`.
Run `dotnet build` and `dotnet list package --vulnerable --include-transitive`
in the API directory. See [browser-test setup](frontend/tests/README.md) for
credential and isolated-database requirements.

Keep database backups, local configuration, credentials, logs, and browser-test
artifacts outside Git. This is a local demo, not a production deployment guide.
Report a suspected credential exposure privately to the repository owner.
