# Local configuration

The API deliberately does not keep database connection details or the JWT signing key in committed configuration.

## Backend

From `backend/IdsFintechPortal.Api`, configure local development with .NET user secrets:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=IdsFintechPortal;Trusted_Connection=True;TrustServerCertificate=True;"
dotnet user-secrets set "Jwt:Key" "replace-this-with-a-unique-random-key-of-at-least-32-characters"
```

Use a unique random value for `Jwt:Key`. Do not reuse the example text and do not commit a signing key. Environment variables override configuration when needed:

```powershell
$env:ConnectionStrings__DefaultConnection = "your connection string"
$env:Jwt__Key = "your unique random signing key"
```

The committed `appsettings.json` contains only safe defaults: JWT issuer, audience, expiry, logging, and allowed browser origins. The API fails at startup with a clear message if `Jwt:Key` is missing, and fails when a database connection is first required if `ConnectionStrings:DefaultConnection` is missing.

## OpenAI portal intelligence pilot

The Product Intelligence workspace uses the OpenAI Responses API. Configure
the key only on the API server. Do not put it in `appsettings.json`, frontend
environment files, SQL Server, documentation, or source control.

From `backend/IdsFintechPortal.Api`, use .NET user secrets for local
development:

```powershell
dotnet user-secrets set "OPENAI_API_KEY" "paste-your-project-key-locally"
```

Alternatively, set it for the process that starts the API:

```powershell
$env:OPENAI_API_KEY = "paste-your-project-key-locally"
```

Restart the API after changing configuration. The committed safe defaults are:

- Endpoint: `https://api.openai.com/v1/responses`
- Model: `gpt-5.6-terra`
- Maximum output: 500 tokens

Override safe settings with `OpenAI__Model`, `OpenAI__Endpoint`, and
`OpenAI__MaxOutputTokens` when required. The endpoint uses `store: false` and
does not enable web search, file search, or other provider tools. If the key is
missing, the authenticated endpoint remains available and reports that AI
generation is not configured without exposing any secret value.

## Frontend

Copy `frontend/.env.example` to `frontend/.env.local` and set `VITE_API_BASE_URL` to the API root. Do not add a trailing slash.

```text
VITE_API_BASE_URL=http://localhost:5242/api
```

## CORS

`Cors:AllowedOrigins` is a specific allow-list, not a wildcard. The committed local value is `http://localhost:5173`. Configure additional deployment origins through the `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`, and subsequent environment variables, or provide the same array through deployment configuration.

The former anonymous database diagnostic endpoint has been removed. Use normal application startup, authenticated API calls, and database tooling for local diagnostics.

## Phase 2 database update

For a fresh setup, use `database/schema.sql` followed by
`database/seed-demo.sql`; `schema.sql` already contains the complete current
Phase 2 schema. The historical additive scripts are retained for an existing
pre-Phase-2 database:

```powershell
sqlcmd -S . -d IdsFintechPortal -E -C -b -Q ":r database\phase2-approvals-notifications.sql"
sqlcmd -S . -d IdsFintechPortal -E -C -b -Q ":r database\phase2-notification-events.sql"
```

Both scripts are additive. The first creates approval and notification tables
and indexes. The second adds reusable notification metadata (`Category`,
related entity fields, and `ReadAt`) and upgrades earlier approval
notifications. Neither script stores provider credentials or other secrets.
