# Implementation Plan — ralph-wiggum-tutorial

## Status

> **Implementation Status: Quick Start ✅ COMPLETE | CI/CD E2E Integration ❌ NOT STARTED | Weather Widget ❌ NOT STARTED**

### Summary
**All Quick Start Steps (1-4) are complete.** The hello-world app is fully functional. Next priorities:
1. **CI/CD E2E Integration** — Add Playwright tests to CI pipeline (currently only runs locally)
2. **Weather Widget Feature** — Full implementation per spec: `specs/home-weather-forecast-widget.md`

| Area | Status | Details |
|------|--------|---------|
| `src/` (hello) | ✅ Complete | Flask app, models, views, templates, errors, logging, schemas, controllers |
| `frontend/` (hello) | ✅ Complete | React Islands, Vite, TypeScript, Tailwind, ESLint, Vitest |
| `scripts/` | ✅ Complete | bootstrap, setup, server, test, lint, typecheck, update, console, db-seed, Procfile |
| `tests/` (hello) | ✅ Complete | conftest.py, test_hello.py, vitest setup |
| `.devcontainer/` | ✅ Complete | Python 3.12, PostgreSQL, Node.js with post-create hook |
| Config files | ✅ Complete | `.gitignore`, `.env.example`, `requirements.txt`, `pyproject.toml`, `eslint.config.js` |
| `.pre-commit-config.yaml` | ✅ Complete | Pre-commit hooks for Python and TypeScript |
| `.github/workflows/` | ⚠️ Partial | CI pipeline for lint, typecheck, test — **E2E tests (Playwright) not integrated** |
| `AGENTS.md` | ✅ Complete | Build/run/test commands and codebase patterns |
| `README.md` | ✅ Complete | Project overview, setup, and development guide |
| `migrations/` | ✅ Complete | Flask-Migrate initialized, hello table migration created |
| **Weather Widget** | ❌ Not started | Backend proxy, React island, tests — see detailed plan below |

---

## Quick Start Implementation Order

✅ **All items below are COMPLETE.** The hello-world app is fully functional with Flask serving a page containing a mounted React island.

### ✅ Step 1 — Environment Foundation (Phase 1.1–1.3) COMPLETE
- ✅ `.devcontainer/devcontainer.json` + post-create.sh
- ✅ `.gitignore`
- ✅ `.env.example`

**Validated:** Container builds, env vars load successfully.

### ✅ Step 2 — Python Backend Core (Phase 2.1–2.3, 2.8–2.9) COMPLETE
- ✅ `requirements.txt`, `requirements-dev.txt`, `pyproject.toml`
- ✅ `src/app/__init__.py` (app factory), `src/app/config.py`
- ✅ `src/app/models/base.py`, `src/app/models/hello.py`, `src/app/models/__init__.py`
- ✅ `src/app/views/__init__.py`, `src/app/views/hello.py`
- ✅ `src/app/templates/base.html`, `src/app/templates/hello/index.html`
- ✅ `src/app/logging_config.py` (Phase 2.4)
- ✅ `src/app/errors.py` + error templates (Phase 2.5)
- ✅ `src/app/schemas/hello.py` (Phase 2.6)
- ✅ `src/app/controllers/hello.py` (Phase 2.7)
- ✅ `src/app/static/` directory setup (Phase 2.10)

**Validated:** `python -c "from app import create_app; create_app()"` works, `curl http://localhost:5000/` returns HTML.

### ✅ Step 3 — React Islands Frontend (Phase 4.1, 4.3–4.4) COMPLETE
- ✅ `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`
- ✅ `frontend/tailwind.config.ts`, `frontend/postcss.config.js`
- ✅ `frontend/eslint.config.js`
- ✅ `frontend/src/styles/globals.css` with Tailwind (Phase 4.2)
- ✅ `frontend/src/main.ts` (island registry), `frontend/src/types/index.ts`
- ✅ `frontend/src/islands/hello/HelloIsland.tsx`, `frontend/src/islands/hello/index.ts`
- ✅ `frontend/vitest.config.ts`, `frontend/tests/islands/hello/HelloIsland.test.tsx` (Phase 4.7)

**Validated:** `cd frontend && npm run build` produces assets, island mounts in browser.

### ✅ Step 4 — Scripts & Runnable App (Phase 5.1–5.7) COMPLETE
- ✅ `script/bootstrap`
- ✅ `script/setup`
- ✅ `script/server`
- ✅ `script/test` (Phase 5.4)
- ✅ `script/lint` (Phase 5.5)
- ✅ `script/typecheck` (Phase 5.6)
- ✅ `script/update`, `script/console`, `script/db-seed`, `Procfile` (Phase 5.7)

**Validated:** `script/setup && script/server` starts Flask + Vite, hello island renders on `http://localhost:5000/`.

### Additional Completed Items
- ✅ `tests/__init__.py`, `tests/conftest.py`, `tests/test_hello.py` (Phase 6.1 - Python tests)
- ✅ `.pre-commit-config.yaml` (Phase 7.1 - Pre-commit hooks)
- ✅ `.github/workflows/ci.yml` (Phase 8.1 - GitHub Actions CI)

### ✅ Quick Start Complete

All Quick Start items are 100% complete:
- ✅ **9.1 AGENTS.md** — Build/run/test commands and codebase patterns
- ✅ **9.2 README.md** — Project overview, setup, and development guide
- ✅ **3.1 Database Migrations** — Flask-Migrate initialized with `e31396db40b1_create_hello_table.py`

---

## ❌ CI/CD E2E Integration

> **Priority:** HIGH — Should be completed before Weather Widget to ensure E2E test coverage in CI
> **Status:** NOT STARTED

### Step 0: Add E2E Tests to CI Pipeline ❌

- **File (modify):** `.github/workflows/ci.yml`
- **Action:** Add a new job or step to run Playwright E2E tests
  - Install Playwright browsers: `npx playwright install --with-deps`
  - Run E2E tests: `npx playwright test`
  - E2E tests auto-start dev servers via `playwright.config.ts` webServer config
- **Dependencies:** Requires PostgreSQL service (already configured in CI)
- **Validation:** Push to branch, verify CI runs E2E tests and passes

---

## ❌ Weather Widget Feature — Implementation Plan

> **Spec:** `specs/home-weather-forecast-widget.md`
> **Status:** NOT STARTED — All items below are pending implementation
> **Dependencies:** Tasks are ordered by dependency; complete each step before the next.

### Overview

A weather forecast widget on the home page that:
1. Uses browser geolocation to get user's lat/lng
2. Calls backend proxy `GET /api/weather?lat={lat}&lng={lng}`
3. Backend calls NWS weather.gov API (`/points` → `forecast`) with required `User-Agent` header
4. Displays current conditions + 5-day forecast with weather icons
5. Renders nothing if user denies location or API fails

### Step 1: Backend Dependencies ❌

- **File:** `requirements.txt`
- **Action:** Add `requests>=2.31.0` (HTTP library for NWS API calls)
- **Validation:** `pip install -r requirements.txt` succeeds

### Step 2: Weather Service ❌

- **File (new):** `src/app/services/__init__.py`
  - Create services package with docstring and `__all__` export for `WeatherService`
  - Follow the pattern in `src/app/controllers/__init__.py`

- **File (new):** `src/app/services/weather_service.py`
  - Class `WeatherService` with static methods (follows controller pattern in `src/app/controllers/hello.py`)
  - Method `get_forecast(lat: float, lng: float) -> dict`:
    1. Validate lat/lng ranges (lat: -90 to 90, lng: -180 to 180)
    2. Call `GET https://api.weather.gov/points/{lat},{lng}` with header `{'User-Agent': '(RalphWiggumTutorial, tutorial@example.com)'}`
    3. Extract `properties.forecast` URL from response
    4. Call `GET <forecast_url>` with same User-Agent header
    5. Parse `properties.periods` into simplified structure: `{ current: {name, temperature, unit, shortForecast, icon, isDaytime}, periods: [{name, temperature, unit, shortForecast, icon, isDaytime}, ...] }`
    6. Return the simplified dict
  - Error handling: raise/return appropriate errors on timeout, invalid coords, NWS 500s
  - Simple in-memory caching with `functools.lru_cache` or dict with TTL to respect NWS rate limits
  - Use `requests.get()` with timeout parameter (e.g., 5 seconds)

### Step 3: Weather Blueprint ❌

- **File (new):** `src/app/views/weather.py`
  - Define `weather_bp = Blueprint('weather', __name__)` (follows pattern in `src/app/views/hello.py`)
  - Route `GET /api/weather`:
    - Accept `lat` and `lng` as query params (`request.args.get()`)
    - Validate params are present and numeric
    - Call `WeatherService.get_forecast(lat, lng)`
    - Return `jsonify(result)` on success
    - Return `jsonify(error=...)`, 400 for missing/invalid params
    - Return `jsonify(error=...)`, 502 for upstream NWS API failures

### Step 4: Register Blueprint ❌

- **File (modify):** `src/app/views/__init__.py`
  - Add `from .weather import weather_bp` inside `register_blueprints()` function
  - Add `app.register_blueprint(weather_bp)` call
  - Follows the existing lazy-import pattern to avoid circular imports

### Step 5: Backend Tests ❌

- **File (new):** `tests/test_weather.py`
  - Uses `client` fixture from `tests/conftest.py` (same as `tests/test_hello.py`)
  - `class TestWeatherAPI:` with tests:
    - `test_weather_missing_params` — `GET /api/weather` without lat/lng returns 400
    - `test_weather_invalid_params` — `GET /api/weather?lat=abc&lng=def` returns 400
    - `test_weather_out_of_range` — `GET /api/weather?lat=999&lng=999` returns 400
    - `test_weather_success` — Mock `requests.get` to return valid NWS JSON, verify 200 + correct response shape
    - `test_weather_upstream_failure` — Mock `requests.get` to raise/return error, verify 502
    - `test_weather_timeout` — Mock `requests.get` to raise `requests.Timeout`, verify 502
  - Use `unittest.mock.patch` to mock `requests.get` (never call real NWS API in tests)
  - Mock data should mirror actual NWS API response structure
- **Validation:** `PYTHONPATH=src pytest tests/test_weather.py -v` passes

### Step 6: Frontend Types ❌

- **File (modify):** `frontend/src/types/index.ts`
  - Add weather-related types:
    ```typescript
    export interface WeatherPeriod {
      name: string
      temperature: number
      unit: string
      shortForecast: string
      icon: string
      isDaytime: boolean
    }

    export interface WeatherData {
      current: WeatherPeriod
      periods: WeatherPeriod[]
    }
    ```

### Step 7: WeatherIcon Component ❌

- **File (new):** `frontend/src/islands/weather/WeatherIcon.tsx`
  - Functional component that maps NWS `shortForecast` strings to emoji or SVG icons
  - Props: `{ forecast: string }` (e.g., "Sunny", "Partly Cloudy", "Rain")
  - Map common forecast strings to visual icons (☀️, ⛅, 🌧️, ❄️, ⛈️, 🌫️, etc.)
  - Fallback icon for unrecognized forecasts
  - Styled with Tailwind

### Step 8: WeatherIsland Component ❌

- **File (new):** `frontend/src/islands/weather/WeatherIsland.tsx`
  - Functional component following `frontend/src/islands/hello/HelloIsland.tsx` patterns
  - State: `weatherData` (WeatherData | null), `loading` (boolean), `error` (string | null)
  - On mount (`useEffect`):
    1. Call `navigator.geolocation.getCurrentPosition()` to get lat/lng
    2. If denied/unavailable → render nothing (return `null`)
    3. Fetch `GET /api/weather?lat=${lat}&lng=${lng}`
    4. Set `weatherData` from response
  - Render states:
    - **Loading:** Skeleton/spinner while fetching (Tailwind `animate-pulse`)
    - **Error/denied:** Return `null` (widget hidden entirely per spec)
    - **Success:** Current temp + icon + short forecast, then 5-day forecast strip (horizontal scroll or grid of WeatherIcon cards)
  - Styled with Tailwind classes (matches existing app aesthetic)

### Step 9: Weather Island Mount ❌

- **File (new):** `frontend/src/islands/weather/index.tsx`
  - Export `mount(element: HTMLElement, props: unknown): void` function
  - Follow pattern in `frontend/src/islands/hello/index.tsx`:
    1. Clear element innerHTML (remove loading placeholder)
    2. `createRoot(element).render(<WeatherIsland />)`
  - No server-side props needed (weather data comes from browser geolocation + API call)

### Step 10: Register Island ❌

- **File (modify):** `frontend/src/main.ts`
  - Add to `islandRegistry`:
    ```typescript
    weather: () => import('./islands/weather'),
    ```
  - Follows existing pattern for hello island registration

### Step 11: Add Mount Point to Template ❌

- **File (modify):** `src/app/templates/hello/index.html`
  - Add a `<div data-island="weather">` mount point **before** the hello island section
  - No `data-props` attribute needed (weather data fetched client-side via geolocation)
  - Include a loading placeholder inside the div (Tailwind `animate-pulse` skeleton)
  - Example:
    ```html
    {# Weather Island Mount Point #}
    <div data-island="weather" class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
    </div>
    ```

### Step 12: Frontend Tests ❌

- **File (new):** `frontend/tests/islands/weather/WeatherIsland.test.tsx`
  - Use Vitest + React Testing Library (same as `frontend/tests/islands/hello/HelloIsland.test.tsx`)
  - Mock `navigator.geolocation` with `vi.stubGlobal`
  - Mock `fetch` to return weather data
  - Tests:
    - Renders loading state initially
    - Renders weather data after successful fetch
    - Renders nothing when geolocation denied
    - Renders nothing when API returns error
    - Displays current temperature and forecast
    - Displays 5-day forecast periods
- **Validation:** `cd frontend && npm test` passes

### Step 13: E2E Tests ❌

- **File (new):** `e2e/weather.spec.ts`
  - Playwright tests following patterns in `e2e/hello.spec.ts`
  - Use `context.grantPermissions(['geolocation'])` and `context.setGeolocation()` to mock browser geolocation
  - Mock the `/api/weather` endpoint with `page.route()` to avoid real NWS API calls
  - Tests:
    - Weather widget visible when geolocation granted + API succeeds
    - Weather widget hidden when geolocation denied
    - Weather widget displays temperature and forecast data
    - Weather widget handles API error gracefully (hidden, no crash)
- **Validation:** `npx playwright test e2e/weather.spec.ts` passes

### Step 14: Final Validation ❌

- Run full test suite: `script/test` (pytest + vitest both pass)
- Run E2E tests: `script/test-e2e` (all Playwright tests pass)
- Run typechecks: `script/typecheck` (mypy + tsc both pass)
- Run linters: `script/lint` (flake8 + eslint both pass)
- Manual verification: `script/server` → visit http://localhost:5000/ → weather widget appears (with location permission)

---

## ✅ COMPLETED PHASES (Detailed Summary)

### Phase 1: Foundation (Environment & Configuration)
**Status: ✅ 100% Complete**

All environment setup complete:
- `.devcontainer/devcontainer.json` — Python 3.12, PostgreSQL, Node.js
- `.devcontainer/post-create.sh` — Runs setup script automatically
- `.gitignore` — Configured for Python, Node.js, IDE, build artifacts
- `.env.example` — Template with DATABASE_URL, FLASK_ENV, SECRET_KEY, FLASK_DEBUG

### Phase 2: Python Backend Foundation
**Status: ✅ 100% Complete**

All backend code implemented:
- `requirements.txt` & `requirements-dev.txt` — Flask, SQLAlchemy, Pydantic, pytest, mypy
- `pyproject.toml` — Tool configurations (pytest, mypy, flake8)
- `src/app/__init__.py` — App factory with extension initialization
- `src/app/config.py` — Configuration classes (Dev/Prod/Test)
- `src/app/models/` — Base model, Hello model with SQLAlchemy
- `src/app/logging_config.py` — JSON in production, human-readable in development
- `src/app/errors.py` — Error handlers returning JSON/HTML
- `src/app/templates/errors/` — Error pages (400, 404, 500)
- `src/app/schemas/hello.py` — Pydantic schemas for validation
- `src/app/controllers/hello.py` — Business logic layer
- `src/app/views/hello.py` — Flask blueprint with routes (GET /, GET/POST /api/hello)
- `src/app/templates/` — Base template with Vite integration, Hello page with island mount
- `src/app/static/` — Directory for Vite build output

### Phase 3: Database Migrations
**Status: ✅ 100% Complete**

Flask-Migrate initialized and first migration created:
- `migrations/` directory initialized with Alembic configuration
- `migrations/versions/e31396db40b1_create_hello_table.py` — First migration for hello table

### Phase 4: React Islands Frontend
**Status: ✅ 100% Complete**

All frontend code implemented:
- `frontend/package.json` — Dependencies and scripts (dev, build, lint, typecheck, test)
- `frontend/tsconfig.json` — TypeScript configuration
- `frontend/vite.config.ts` — Vite build → `../src/app/static/`, manifest.json for production
- `frontend/tailwind.config.ts` & `frontend/postcss.config.js` — Tailwind CSS setup
- `frontend/eslint.config.js` — ESLint flat config for TypeScript
- `frontend/src/styles/globals.css` — Tailwind imports
- `frontend/src/main.ts` — Island registry with auto-mount logic
- `frontend/src/types/index.ts` — Shared TypeScript types
- `frontend/src/islands/hello/HelloIsland.tsx` — React component with API fetch
- `frontend/src/islands/hello/index.ts` — Island mount logic
- `frontend/vitest.config.ts` — Vitest configuration
- `frontend/tests/islands/hello/HelloIsland.test.tsx` — Component tests

### Phase 5: Scripts to Rule Them All
**Status: ✅ 100% Complete**

All operational scripts implemented:
- `script/bootstrap` — Install dependencies
- `script/setup` — Full environment setup (bootstrap, .env, DB init, pre-commit)
- `script/server` — Start Flask + Vite servers (concurrent execution)
- `script/test` — Run all tests (pytest + vitest)
- `script/lint` — Run all linters (flake8 + eslint)
- `script/typecheck` — Run type checkers (mypy + tsc)
- `script/update` — Update dependencies
- `script/console` — Flask shell
- `script/db-seed` — Seed database with dev data
- `Procfile` — Production server config

### Phase 6: Testing Infrastructure
**Status: ✅ 100% Complete**

Python tests implemented:
- `tests/__init__.py` — Test package marker
- `tests/conftest.py` — Pytest fixtures (app, client, db)
- `tests/test_hello.py` — Hello route tests

### Phase 7: Pre-commit & Quality
**Status: ✅ 100% Complete**

Pre-commit hooks configured:
- `.pre-commit-config.yaml` — Hooks for trailing whitespace, YAML validation, flake8, mypy, eslint

### Phase 8: CI/CD
**Status: ✅ 100% Complete**

GitHub Actions pipeline implemented:
- `.github/workflows/ci.yml` — Jobs for lint, typecheck, test with PostgreSQL service

---

## 📋 REMAINING ITEMS

### ✅ Quick Start — COMPLETE
All Quick Start phases (1–9) are finished. The hello-world app is fully functional.

### ❌ CI/CD E2E Integration (Step 0 — see detailed plan above)
- ❌ Step 0: Add Playwright E2E tests to `.github/workflows/ci.yml`

### ❌ Weather Widget Feature (14 steps — see detailed plan above)
- ❌ Steps 1–5: Backend (dependencies, service, blueprint, registration, tests)
- ❌ Steps 6–12: Frontend (types, components, island mount, registration, template, tests)
- ❌ Step 13: E2E tests
- ❌ Step 14: Full validation
