# IDS Fintech Products Portal Frontend

This directory contains the React and TypeScript client for the IDS Fintech
Products Portal. The frontend is integrated with the .NET REST API and is not the
original Vite starter application.

## Current frontend status

The internship MVP UI is complete, including login, dashboard, products, product
details and management, clients, client details and management, deployments,
environments, servers, team responsibilities, technologies, repository/document
links, user administration, search, filtering, responsive layouts, empty states,
validation, and role-aware controls.

Phase 2 frontend work currently includes:

- `/approvals` for deployment approval submission and review;
- `/notifications` for event filtering, deep links, mark-read, and mark-all-read;
- an exact unread notification badge in the application shell;
- `/intelligence` for grounded IDS portal questions, suggestions, source links,
  provider status, and graceful missing-provider behavior;
- top-bar queries that route into Portal Intelligence.

Live OpenAI-generated answers remain unverified until `OPENAI_API_KEY` is
configured on the backend. The key must never be placed in this frontend or any
`VITE_` environment variable.

## Technology

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Tabler Icons
- ESLint 10

The visual system is implemented primarily in `src/App.css` and follows the
enterprise direction in the root `DESIGN.md`.

## Local development

Copy `.env.example` to `.env.local` if needed and set only the API base URL:

```env
VITE_API_BASE_URL=http://localhost:5242/api
```

Do not include a trailing slash. Start the backend first, then run:

```powershell
npm install
npm run dev
```

The default Vite development URL is `http://localhost:5173` and must be allowed
by the backend CORS configuration.

## Quality checks

```powershell
npm run lint
npm run build
```

The latest completed verification passed lint and the production build, then
exercised authenticated desktop and 390px mobile workflows with Playwright. The
final browser pass had zero application console errors or warnings.

## Access control

`ProtectedRoute` requires authentication. `RoleProtectedRoute`, permission
helpers, navigation visibility, and action controls improve the user experience,
but the .NET API remains the security authority. Do not treat hidden frontend
controls as authorization.

## Further documentation

- Root `README.md`: project overview and current completion status.
- Root `SESSION_HANDOFF.md`: detailed implementation and verification record.
- Root `CONFIGURATION.md`: backend secrets, CORS, OpenAI, and database setup.
- Root `DESIGN.md`: UI direction and constraints.
