# Database Handoff

## Requirements

- SQL Server Developer, Express, or another compatible local SQL Server installation
- Permission to restore a database or create tables locally
- `sqlcmd` or SQL Server Management Studio

The application database is named `IdsFintechPortal`.

## Option A: Restore the private backup

The private instructor package contains `database/IdsFintechPortal-demo.bak`. Restore it as `IdsFintechPortal`. Check logical file names first:

```sql
RESTORE FILELISTONLY
FROM DISK = N'<private path>\IdsFintechPortal-demo.bak';
```

Restore data and log files to the local SQL Server data directory. Do not overwrite an existing database without a deliberate backup and confirmation.

## Option B: Rebuild from scripts

From the repository root:

```powershell
sqlcmd -S . -d master -E -C -b -Q "IF DB_ID(N'IdsFintechPortal') IS NULL CREATE DATABASE [IdsFintechPortal]"
sqlcmd -S . -d master -E -C -b -Q ":r database\schema.sql" -v DatabaseName=IdsFintechPortal
sqlcmd -S . -d master -E -C -b -Q ":r database\seed-demo.sql" -v DatabaseName=IdsFintechPortal
```

`schema.sql` is the complete current schema, including Phase 2 approval and notification tables. It contains no application data or secrets. `seed-demo.sql` contains synthetic demonstration data and BCrypt password hashes and can be rerun safely for supported records.

## Phase 2 script history

- `database/phase2-approvals-notifications.sql` documents the additive approval and notification schema change.
- `database/phase2-notification-events.sql` documents notification-event additions.
- A fresh setup should use `schema.sql`, which already includes their final schema.
- EF Core migrations are not used.

## Verify the setup

```sql
SELECT DB_NAME() AS CurrentDatabase;
SELECT COUNT(*) AS ProductCount FROM dbo.Products;
SELECT COUNT(*) AS ClientCount FROM dbo.Clients;
SELECT COUNT(*) AS DeploymentCount FROM dbo.Deployments;
SELECT COUNT(*) AS EnvironmentCount FROM dbo.Environments;
SELECT COUNT(*) AS PendingApprovalCount FROM dbo.ApprovalRequests WHERE Status = N'Pending';
SELECT COUNT(*) AS UnreadNotificationCount FROM dbo.Notifications WHERE ReadAt IS NULL;
```

The seeded database contains products, clients, deployments, UAT/Production/Testing environments, servers, modules, repositories, documents, team members, responsibilities, approvals, and notifications.

## Application configuration

Keep the connection string and JWT signing key in local user-secrets or environment variables:

```powershell
cd backend\IdsFintechPortal.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<private local SQL connection string>"
dotnet user-secrets set "Jwt:Key" "<private local signing key>"
```

Do not place real values in this file, SQL scripts, GitHub, screenshots, logs, or the public README.

## Handoff policy

- The `.bak` is a private submission artifact and is ignored by Git.
- The schema and seed scripts are the reproducible public database handoff.
- All seeded names, emails, clients, products, and infrastructure values are synthetic.
- No employee, customer, production credential, API key, JWT secret, or database password is included.
