## Build & Run

**Bootstrap** (first time only):
```bash
script/bootstrap  # Installs Python and Node dependencies
```

**Setup** (first time and after migrations):
```bash
script/setup  # Creates .env, database, runs migrations
```

**Server** (development):
```bash
script/server  # Starts Flask on :5000 + Vite on :5173
```

## Cleanup

Run these slash commands to clean up code:
- `/python-code-simplifier` - Simplifies recently modified Python code for clarity and maintainability while preserving functionality.
- `/typescript-code-simplifier` - Simplifies recently modified TypeScript code for clarity and maintainability while preserving functionality.

## Validation

Run these after implementing to get immediate feedback:

- Tests: `script/test` → `pytest` + `vitest`
  - Direct: `PYTHONPATH=src pytest tests/` (backend) + `cd frontend && npm test` (frontend)
- Typecheck: `script/typecheck` → `mypy` + `tsc`
  - Direct: `mypy src/ --ignore-missing-imports` + `cd frontend && npm run typecheck`
- Lint: `script/lint` → `flake8` + `eslint`
  - Direct: `flake8 src/ tests/` + `cd frontend && npm run lint`

## Operational Notes

- **Backend**: Flask on :5000, `PYTHONPATH=src` required when running pytest directly
- **Frontend**: Vite dev server on :5173, React Islands pattern with `data-island` attributes in templates
- **Database**: PostgreSQL, connection via `DATABASE_URL` env var (set by `script/setup`)
- **Dev environment**: `.env` created by `script/setup`, contains all runtime config

### Codebase Patterns

- Backend: Python/Flask in `src/`, tests in `tests/`
- Frontend: React in `frontend/`, compiled to static assets
- Templates: Jinja2 with Islands hydration points (`data-island` attributes)
- Migrations: Alembic in `migrations/`, auto-applied by `script/setup`


### Commit Messages
Use the slash command `/git-commit` to create well-structured git commits.
