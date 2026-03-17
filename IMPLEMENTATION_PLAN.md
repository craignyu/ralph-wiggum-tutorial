# Implementation Plan — Dig Dug Classic Arcade Game

## Status

> **Dig Dug Game Implementation: ~90% Complete**

All game code is implemented and working. Backend API, frontend game engine, React components, and unit tests all pass. Remaining work: E2E tests and final integration validation.

| Area | Status |
|------|--------|
| Starter infrastructure (Flask, React Islands, scripts, CI) | ✅ Complete |
| Dig Dug backend (model, migration, controller, views) | ✅ Complete |
| Dig Dug frontend (engine, renderer, components, hooks) | ✅ Complete |
| Dig Dug unit tests (pytest 23/23, vitest 15/15) | ✅ Complete |
| E2E tests (Playwright) | ❌ Not started |

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

### Phase 5: Testing (Partial) ✅
- [x] **5.1** Frontend engine tests (8 tests in `GameEngine.test.ts`)
- [x] **5.2** Frontend component tests (3 tests in `DigDugGame.test.tsx`)
- [ ] **5.3** E2E tests (`e2e/digdug.spec.ts`) — not yet created

### Phase 6: Polish & Validation (Partial) ✅
- [x] **6.1** Home page link to `/game`
- [x] **6.2** Lint clean (flake8 + eslint pass)
- [x] **6.3** Typecheck clean (mypy + tsc pass)
- [x] **6.4** All unit tests pass (23 pytest + 15 vitest)
- [ ] **6.5** E2E tests pass — depends on 5.3

---

## Remaining Work

### E2E Tests (Phase 5.3)
Create `e2e/digdug.spec.ts` with Playwright tests:
- Clean save slots via API in beforeEach
- Navigate to `/game`, verify page title
- Verify canvas is visible within `[data-island="digdug"]`
- Verify HUD elements (score, lives, level)
- Press P → verify pause overlay with "PAUSED" text
- Press P again → verify unpause
- Save/load workflow via pause menu
- Press R → verify restart
- API cleanup verification

---

## Learnings

- **Pydantic error serialization**: `e.errors()` returns objects with non-serializable `ValueError` instances. Use `e.errors(include_url=False, include_context=False)` for clean JSON output.
- **Canvas mocking in vitest**: Mock `HTMLCanvasElement.prototype.getContext` returning all needed 2D context methods (`fillRect`, `arc`, `beginPath`, `fill`, `stroke`, `roundRect`, `setLineDash`, etc.).
- **Test database**: pytest uses SQLite in-memory via `db.create_all()` — no Alembic migration needed for tests.
- **requestAnimationFrame in tests**: Must `vi.spyOn(window, 'requestAnimationFrame')` to prevent infinite loops.
- **fetch in jsdom**: Relative URLs like `/api/...` fail in jsdom — mock `global.fetch` in component tests.
