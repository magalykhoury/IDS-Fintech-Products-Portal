# Playwright regression suite

The suite uses the existing demo accounts, but passwords are intentionally read only from local environment variables:

```powershell
$env:E2E_ADMIN_PASSWORD = "<private local value>"
$env:E2E_ADMIN_USERNAME = "e2e.admin"
$env:E2E_VIEWER_PASSWORD = "<private local value>"
$env:E2E_VIEWER_USERNAME = "e2e.viewer"
$env:E2E_MANAGER_PASSWORD = "<private local value>"
$env:E2E_MANAGER_USERNAME = "e2e.manager"
$env:E2E_IMPLEMENTATION_PASSWORD = "<private local value>"
$env:E2E_IMPLEMENTATION_USERNAME = "e2e.requester"
$env:E2E_DEVELOPER_PASSWORD = "<private local value>"
```

Read-only and authentication tests can run against the normal API. Write-heavy product and approval tests are disabled unless explicitly opted in:

```powershell
$env:E2E_API_URL = "http://localhost:5243/api"
$env:E2E_DATABASE_NAME = "IdsFintechPortal_E2E"
$env:E2E_ALLOW_MUTATIONS = "true"
npm run test:e2e
```

Only set `E2E_ALLOW_MUTATIONS=true` when the API points at an isolated disposable database clone. The write tests create uniquely named records and clean them up, but the opt-in guard prevents an accidental run against the demo database. No password, token, API key, or database connection string belongs in this file or in a committed environment file.
