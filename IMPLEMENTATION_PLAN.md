# Implementation Plan — Dig Dug Classic Arcade Game

## Status

> **Dig Dug Game Implementation: 100% Complete** ✅

All phases implemented and verified. Backend API, frontend game engine, React components, unit tests, and E2E tests all pass.

| Area | Status |
|------|--------|
| Starter infrastructure (Flask, React Islands, scripts, CI) | ✅ Complete |
| Dig Dug backend (model, migration, controller, views) | ✅ Complete |
| Dig Dug frontend (engine, renderer, components, hooks) | ✅ Complete |
| Dig Dug unit tests (pytest 23/23, vitest 15/15) | ✅ Complete |
| E2E tests (Playwright 15/15 digdug + 9/9 hello) | ✅ Complete |

### Key Design Decisions

- **No new dependencies required.** The game engine is pure TypeScript (Canvas API + `requestAnimationFrame`). Backend uses existing SQLAlchemy, Flask, Pydantic, Alembic.
- **Save format is minimal.** Saves store score/level/lives/high_score only — the board is deterministically regenerated from the level number on load. No mid-level board state is persisted.
- **All graphics are geometric primitives** drawn on Canvas 2D — no image assets, no copyright concerns.
- **Game-specific hooks** (`useKeyboard`, `useGameSaves`) live in `frontend/src/islands/digdug/hooks/`.
- **Game loop is frame-count based** (60fps via `requestAnimationFrame`), making physics and AI deterministic.

---

## Completed Work

### Phase 1: Backend Data Layer ✅
- [x] **1.1** GameSave model (`src/app/models/game_save.py`)
- [x] **1.2** Alembic migration (`create_game_saves_table`)
- [x] **1.3** GameSave schemas (`src/app/schemas/game_save.py`)
- [x] **1.4** GameSaveController (`src/app/controllers/game_save.py`)
- [x] **1.5** Game blueprint & routes (`src/app/views/game.py`)
- [x] **1.6** Game page template (`src/app/templates/game/index.html`)
- [x] **1.7** Backend tests (`tests/test_game.py` — 11 tests)

### Phase 2: Frontend Types & Island Stub ✅
- [x] **2.1** TypeScript types (`GameSave`, `GameSaveCreate` in `frontend/src/types/index.ts`)
- [x] **2.2** Island directory scaffold + registration in `main.ts`

### Phase 3: Game Engine Core ✅
- [x] **3.1** Engine constants (`engine/constants.ts`)
- [x] **3.2** Engine types (`engine/types.ts`)
- [x] **3.3** Level generator (`engine/Level.ts`) — deterministic by level number
- [x] **3.4** Player entity (`engine/entities/Player.ts`)
- [x] **3.5** Base Enemy entity (`engine/entities/Enemy.ts`)
- [x] **3.6** Pooka enemy (`engine/entities/Pooka.ts`)
- [x] **3.7** Fygar enemy (`engine/entities/Fygar.ts`)
- [x] **3.8** Rock entity (`engine/entities/Rock.ts`)
- [x] **3.9** GameEngine core loop (`engine/GameEngine.ts`)
- [x] **3.10** Collision detection (within GameEngine.ts)
- [x] **3.11** State transitions & scoring (within GameEngine.ts)
- [x] **3.12** Canvas renderer (`engine/Renderer.ts`)

### Phase 4: React UI Components ✅
- [x] **4.1** useKeyboard hook
- [x] **4.2** useGameSaves hook
- [x] **4.3** GameHUD component
- [x] **4.4** PauseOverlay component
- [x] **4.5** SaveLoadModal component
- [x] **4.6** DigDugGame main component
- [x] **4.7** Island mount finalization

### Phase 5: Testing ✅
- [x] **5.1** Frontend engine tests (8 tests in `GameEngine.test.ts`)
- [x] **5.2** Frontend component tests (3 tests in `DigDugGame.test.tsx`)
- [x] **5.3** E2E tests (`e2e/digdug.spec.ts` — 15 tests: 9 UI + 6 API)

### Phase 6: Polish & Validation ✅
- [x] **6.1** Home page link to `/game`
- [x] **6.2** Lint clean (flake8 + eslint pass)
- [x] **6.3** Typecheck clean (mypy + tsc pass)
- [x] **6.4** All unit tests pass (23 pytest + 15 vitest)
- [x] **6.5** All E2E tests pass (24/24 — 15 digdug + 9 hello)

---

## Learnings

- **Pydantic error serialization**: `e.errors()` returns objects with non-serializable `ValueError` instances. Use `e.errors(include_url=False, include_context=False)` for clean JSON output.
- **Canvas mocking in vitest**: Mock `HTMLCanvasElement.prototype.getContext` returning all needed 2D context methods (`fillRect`, `arc`, `beginPath`, `fill`, `stroke`, `roundRect`, `setLineDash`, etc.).
- **Test database**: pytest uses SQLite in-memory via `db.create_all()` — no Alembic migration needed for tests.
- **requestAnimationFrame in tests**: Must `vi.spyOn(window, 'requestAnimationFrame')` to prevent infinite loops.
- **fetch in jsdom**: Relative URLs like `/api/...` fail in jsdom — mock `global.fetch` in component tests.
- **Playwright keyboard timing**: `page.keyboard.press('p')` fires keydown+keyup too fast for polling-based input (16ms interval). Use `keyboard.down('p')` → `waitForTimeout(50)` → `keyboard.up('p')` to ensure the poll catches the key state.
- **Playwright browser install**: Run `npx playwright install chromium` if browsers aren't cached (e.g., fresh codespace).
