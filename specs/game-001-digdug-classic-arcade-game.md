# Feature: Dig Dug Classic Arcade Game

## Feature Description
Add a fully playable browser-based recreation of the 1982 Namco arcade classic "Dig Dug" to the application. Players control Taizo Hori as he digs through underground tunnels, inflates and defeats enemies (Pooka and Fygar), and drops rocks on foes to earn bonus points. The game features keyboard controls, pause/resume, restart, and a persistent save-game system with multiple save slots backed by the PostgreSQL database.

## User Story
As a user of the application,
I want to play a classic Dig Dug arcade game in my browser,
So that I can enjoy nostalgic gameplay with modern save/load features that let me continue my progress across sessions.

## Problem Statement
The app currently only demonstrates CRUD patterns. There is no engaging interactive experience. Adding a playable game showcases the React Islands architecture's capacity for rich, stateful, real-time UIs while also exercising the full stack (canvas rendering, keyboard input, REST save/load API, PostgreSQL persistence).

## Solution Statement
Implement Dig Dug as a self-contained React Island backed by a Canvas-based game engine written in TypeScript, with an arcade-faithful gameplay target. The island mounts at `/game` (a new Flask route). Game state lives entirely in frontend memory; only save slots are persisted to the backend via a REST API. The save system allows up to 3 named save slots, each storing score, level number, lives remaining, and high score.

---

## Relevant Files

### Existing Files to Modify
- **`src/app/models/__init__.py`** – Export the new `GameSave` model.
- **`src/app/controllers/__init__.py`** – Export the new `GameSaveController`.
- **`src/app/schemas/__init__.py`** – Export `GameSaveCreate` and `GameSaveResponse` schemas.
- **`src/app/views/__init__.py`** – Register the new `game_bp` blueprint.
- **`src/app/templates/hello/index.html`** – Add a visible link/button to `/game` so the feature is discoverable from the landing page.
- **`frontend/src/main.ts`** – Register the `digdug` island in `islandRegistry`.
- **`frontend/src/types/index.ts`** – Add `GameSave` and related TypeScript types.

### New Files to Create

#### Backend
- **`src/app/models/game_save.py`** – SQLAlchemy `GameSave` model (`id`, `slot_number`, `slot_name`, `score`, `high_score`, `level`, `lives`, `created_at`, `updated_at`).
- **`src/app/controllers/game_save.py`** – `GameSaveController` with `get_all`, `get_by_slot`, `upsert`, `delete` static methods.
- **`src/app/schemas/game_save.py`** – Pydantic `GameSaveCreate` and `GameSaveResponse` schemas.
- **`src/app/views/game.py`** – Flask Blueprint `game_bp` with routes: `GET /game`, `GET /api/game/saves`, `POST /api/game/saves`, `DELETE /api/game/saves/<slot_number>`.
- **`src/app/templates/game/index.html`** – Jinja2 template extending `base.html` with a `data-island="digdug"` mount point.
- **`migrations/versions/XXXX_create_game_saves_table.py`** – Alembic migration creating the `game_saves` table.

#### Frontend
- **`frontend/src/islands/digdug/index.tsx`** – Island mount entry point.
- **`frontend/src/islands/digdug/DigDugGame.tsx`** – Top-level React component that wires canvas, HUD, overlays, save/load modal, and keyboard input.
- **`frontend/src/islands/digdug/engine/constants.ts`** – Grid dimensions, speeds, tile types, score values, colors.
- **`frontend/src/islands/digdug/engine/types.ts`** – Internal engine TypeScript interfaces (`GameState`, `PlayerState`, `EnemyState`, `RockState`, `Tile`, `Direction`).
- **`frontend/src/islands/digdug/engine/Level.ts`** – `LevelData` class: generates per-level dirt grids, enemy spawn lists, rock positions with increasing difficulty.
- **`frontend/src/islands/digdug/engine/entities/Player.ts`** – Player movement, digging logic, pump charging/firing.
- **`frontend/src/islands/digdug/engine/entities/Enemy.ts`** – Base enemy class with pathfinding and inflation state machine.
- **`frontend/src/islands/digdug/engine/entities/Pooka.ts`** – Pooka enemy subclass (wanders tunnels, can phase through dirt).
- **`frontend/src/islands/digdug/engine/entities/Fygar.ts`** – Fygar enemy subclass (breathes fire horizontally).
- **`frontend/src/islands/digdug/engine/entities/Rock.ts`** – Rock entity (falls when unsupported, crushes enemies).
- **`frontend/src/islands/digdug/engine/GameEngine.ts`** – Core game loop (`requestAnimationFrame`), collision detection, scoring, level transitions, lives management.
- **`frontend/src/islands/digdug/engine/Renderer.ts`** – Canvas 2D rendering for all game entities, dirt grid, score, and lives HUD.
- **`frontend/src/islands/digdug/components/GameHUD.tsx`** – React overlay displaying score, high score, level, lives (rendered as React DOM layer above canvas).
- **`frontend/src/islands/digdug/components/PauseOverlay.tsx`** – Semi-transparent pause screen with resume/restart/save/quit buttons.
- **`frontend/src/islands/digdug/components/SaveLoadModal.tsx`** – Modal showing 3 save slots; supports save-to-slot and load-from-slot.
- **`frontend/src/islands/digdug/hooks/useGameSaves.ts`** – Custom React hook for fetching, saving, and deleting save slots via the REST API.
- **`frontend/src/islands/digdug/hooks/useKeyboard.ts`** – Custom React hook for keyboard event management (arrow keys, WASD, P, R, Space, Escape).

#### Tests
- **`tests/test_game.py`** – pytest tests for game save API endpoints and controller.
- **`frontend/tests/islands/digdug/GameEngine.test.ts`** – Vitest unit tests for game engine logic (scoring, collision, level transitions).
- **`frontend/tests/islands/digdug/DigDugGame.test.tsx`** – Vitest component tests for the React game wrapper (renders canvas, shows HUD, pause/resume).
- **`e2e/digdug.spec.ts`** – Playwright E2E tests for the game page, controls, save/load workflow.

---

## Implementation Plan

### Phase 1: Foundation
Set up the backend plumbing: model, migration, controller, schema, blueprint, and template. This provides the `/game` page and the save/load API before any game logic is written.

### Phase 2: Core Implementation
Build the game engine and all entities in TypeScript. Implement the canvas renderer, game loop with `requestAnimationFrame`, keyboard input, scoring, lives, level progression, and all enemy/rock mechanics. Wire it into the React island.

### Phase 3: Integration
Connect save/load to the backend API. Add the HUD overlay, pause overlay, save/load modal, and full keyboard control surface. Ensure the island mounts correctly on `/game` and that saves persist across reloads.

---

## Step by Step Tasks

### Step 1: Create the GameSave Backend Model
- Create `src/app/models/game_save.py` with a `GameSave` SQLAlchemy model:
  - `id: Mapped[int]` (primary key)
  - `slot_number: Mapped[int]` (1–3, unique, not null)
  - `slot_name: Mapped[str]` (max 50 chars, default "Slot N")
  - `score: Mapped[int]` (default 0)
  - `high_score: Mapped[int]` (default 0)
  - `level: Mapped[int]` (default 1)
  - `lives: Mapped[int]` (default 3)
  - `created_at: Mapped[datetime]` (server default)
  - `updated_at: Mapped[datetime]` (server default, onupdate)
- Export `GameSave` from `src/app/models/__init__.py`.

### Step 2: Create the GameSave Alembic Migration
- Generate the migration: `PYTHONPATH=src flask db migrate -m "create_game_saves_table"`.
- Verify the generated file creates `game_saves` with all columns and a unique constraint on `slot_number`.
- Apply with `PYTHONPATH=src flask db upgrade`.

### Step 3: Create GameSave Schema
- Create `src/app/schemas/game_save.py` with:
  - `GameSaveCreate(BaseModel)`: `slot_number` (1–3), `slot_name`, `score`, `high_score`, `level`, `lives` with field validators.
  - `GameSaveResponse(BaseModel)`: same fields plus `id`, `created_at`, `updated_at` with `model_config = ConfigDict(from_attributes=True)`.
- Export both from `src/app/schemas/__init__.py`.

### Step 4: Create GameSaveController
- Create `src/app/controllers/game_save.py` with `GameSaveController`:
  - `get_all() -> list[GameSave]` – return all saves ordered by `slot_number`.
  - `get_by_slot(slot_number: int) -> GameSave | None` – find by slot.
  - `upsert(data: GameSaveCreate) -> tuple[GameSave, bool]` – insert or update by `slot_number`, where `bool` indicates whether a new row was created.
    - If slot exists: update `slot_name`, `score`, `high_score`, `level`, `lives`.
    - If slot does not exist: create a new row.
  - `delete(slot_number: int) -> bool` – remove save, return `True` if existed.
- Export from `src/app/controllers/__init__.py`.

### Step 5: Create the Game Blueprint and Template
- Create `src/app/views/game.py` with `game_bp = Blueprint('game', __name__)`:
  - `GET /game` → render `game/index.html` with no initial data.
  - `GET /api/game/saves` → return JSON list of saves.
  - `POST /api/game/saves` → validate with `GameSaveCreate`, call `upsert`:
    - return `201` when a slot is created
    - return `200` when an existing slot is updated
    - return `400` on validation errors (align with existing API style in this codebase)
  - `DELETE /api/game/saves/<int:slot_number>` → call `delete`, return 204 or 404.
- Register `game_bp` in `src/app/views/__init__.py`.
- Registration pattern in `src/app/views/__init__.py`:
  ```python
  from .hello import hello_bp
  from .game import game_bp

  app.register_blueprint(hello_bp)
  app.register_blueprint(game_bp)
  ```
- Create `src/app/templates/game/index.html`:
  ```html
  {% extends "base.html" %}
  {% block title %}Dig Dug — Classic Arcade{% endblock %}
  {% block content %}
  <main class="flex flex-col items-center min-h-screen bg-black py-4">
    <div data-island="digdug" class="w-full max-w-2xl"></div>
   </main>
   {% endblock %}
   ```

### Step 5.5: Add Feature Entry Point from Home Page
- Update `src/app/templates/hello/index.html` to include a clear CTA link/button to `/game` (for example, near the main heading).
- This ensures the game is discoverable and not orphaned behind a direct URL.

### Step 6: Add TypeScript Types for Game Saves
- Append to `frontend/src/types/index.ts`:
  ```typescript
  export interface GameSave {
    id: number
    slot_number: number
    slot_name: string
    score: number
    high_score: number
    level: number
    lives: number
    created_at: string
    updated_at: string
  }

  export interface GameSaveCreate {
    slot_number: number
    slot_name: string
    score: number
    high_score: number
    level: number
    lives: number
  }
  ```

### Step 7: Create E2E Test File (Early, for Reference During Development)
- Create `e2e/digdug.spec.ts` with Playwright tests that:
  - Use `test.beforeEach` to clean slot 1–3 via API for test isolation.
  1. Navigate to `/game` and verify the page title is "Dig Dug".
  2. Verify the game canvas is visible (`canvas` element within `[data-island="digdug"]`).
  3. Verify HUD elements are present: score display, lives display, level display.
  4. Press `P` key and verify a pause overlay appears with text "PAUSED".
  5. Press `P` again and verify the pause overlay disappears.
  6. Click the "Save" button in the pause overlay and verify the save/load modal opens with 3 slots.
  7. Click "Save to Slot 1" and verify the slot shows saved data (level 1, score 0).
  8. Reload the page, open the save modal via pause menu, click "Load Slot 1" and verify level 1 is restored.
  9. Press `R` and verify the game restarts (score resets to 0, level resets to 1).
  10. Verify `request.delete('/api/game/saves/1')` returns 204 (cleanup).

### Step 8: Create Game Engine Constants and Types
- Create `frontend/src/islands/digdug/engine/constants.ts`:
  ```typescript
  export const GRID_COLS = 14       // tiles per row
  export const GRID_ROWS = 11       // tiles per column (above dirt: 1 row sky)
  export const TILE_SIZE = 40       // px per tile
  export const CANVAS_WIDTH = GRID_COLS * TILE_SIZE   // 560
  export const CANVAS_HEIGHT = (GRID_ROWS + 1) * TILE_SIZE  // 480

  export const PLAYER_SPEED = 3    // px per frame
  export const ENEMY_SPEED = 1.5
  export const PUMP_RANGE = TILE_SIZE * 1.5
  export const PUMP_HOLD_FRAMES = 60  // frames to fully inflate enemy
  export const ROCK_FALL_SPEED = 4
  export const FIRE_SPEED = 5

  export const SCORE_PUMP_KILL = 200
  export const SCORE_ROCK_KILL = 400
  export const SCORE_ROCK_BONUS = 100   // per additional enemy crushed by same rock
  export const SCORE_DEPTH_MULTIPLIER = [1, 2, 3, 4]  // per row depth tier

  export const INITIAL_LIVES = 3
  export const MAX_LEVEL = 10

  export enum TileType { SKY = 0, DIRT = 1, TUNNEL = 2, ROCK_SLOT = 3 }
  export enum Direction { UP = 'UP', DOWN = 'DOWN', LEFT = 'LEFT', RIGHT = 'RIGHT', NONE = 'NONE' }
  export enum GameStatus { IDLE = 'IDLE', PLAYING = 'PLAYING', PAUSED = 'PAUSED', LEVEL_COMPLETE = 'LEVEL_COMPLETE', GAME_OVER = 'GAME_OVER', WIN = 'WIN' }
  export enum EnemyType { POOKA = 'POOKA', FYGAR = 'FYGAR' }
  export enum EnemyState { WALKING = 'WALKING', INFLATING = 'INFLATING', DEFLATING = 'DEFLATING', DEAD = 'DEAD', GHOSTING = 'GHOSTING' }
  ```
- Create `frontend/src/islands/digdug/engine/types.ts` with interfaces:
  - `Position { x: number; y: number }`
  - `PlayerState { pos: Position; dir: Direction; digging: boolean; pumping: boolean; pumpCharge: number; alive: boolean }`
  - `EnemyEntity { id: number; type: EnemyType; pos: Position; dir: Direction; state: EnemyState; inflateCount: number; ... }`
  - `RockState { id: number; col: number; row: number; falling: boolean; fallY: number }`
  - `GameState { status: GameStatus; score: number; highScore: number; level: number; lives: number; grid: TileType[][]; player: PlayerState; enemies: EnemyEntity[]; rocks: RockState[]; frame: number }`
- Define `GameStatus` transitions explicitly:
  - `PLAYING -> PAUSED` (P/Escape)
  - `PAUSED -> PLAYING` (P/Resume)
  - `PLAYING -> LEVEL_COMPLETE` (all enemies dead), then auto-transition to next `PLAYING` after a short delay
  - `PLAYING -> GAME_OVER` (lives reaches 0)
  - `LEVEL_COMPLETE -> WIN` if `level === MAX_LEVEL`

### Step 9: Implement Level Generator
- Create `frontend/src/islands/digdug/engine/Level.ts` – `Level` class:
  - `generate(levelNum: number): { grid: TileType[][], enemies: EnemySpawnDef[], rocks: RockDef[] }`.
  - Row 0 is sky (TileType.SKY). Rows 1–10 are dirt.
  - Enemy count = 2 + levelNum (capped at 8).
  - Alternate Pooka/Fygar in spawn list.
  - Two pre-placed rocks per level (column 3 and 10, row 2).
  - Deeper levels introduce more Fygar.
  - Generation must be deterministic by level number (same `levelNum` => same board), so save/load behavior is stable.

### Step 10: Implement Player Entity
- Create `frontend/src/islands/digdug/engine/entities/Player.ts` – `Player` class:
  - `update(input: InputState, grid: TileType[][]): void` – moves player, carves `TUNNEL` tiles, transitions pump state.
  - `getPumpHitbox(): Rect | null` – returns pump beam hitbox when pumping.
  - Collision with dirt: carve tile on overlap.
  - Cannot move into `SKY` row from underground except via pre-carved tunnel.
  - Clamp position to canvas bounds.
  - Pump behavior:
    - While pump key is held and an enemy is in range + facing direction, increment `inflateCount` each frame.
    - Releasing early causes enemy deflation (`DEFLATING`).
    - Reaching `PUMP_HOLD_FRAMES` kills enemy and awards `SCORE_PUMP_KILL`.
    - Player movement is disabled while actively pumping.

### Step 11: Implement Enemy Entities
- Create `frontend/src/islands/digdug/engine/entities/Enemy.ts` – base `Enemy` class:
  - `update(grid: TileType[][], playerPos: Position): void` – simple pathfinding: pick direction toward player along tunnels; if stuck, try to ghost through dirt periodically.
  - Inflation state machine: when pump hits → `INFLATING`, increment `inflateCount`; when pump released → `DEFLATING` (resets over time); at max inflate → `DEAD`.
- Create `Pooka.ts` extending `Enemy` – wanders tunnels, enters ghost mode every 10 seconds to pass through dirt.
- Create `Fygar.ts` extending `Enemy` – additionally fires a `fire` projectile horizontally:
  - Fire only when facing the player and player is within 3 tiles horizontally.
  - Fire cooldown: once every 120 frames.
  - Fire travels at `FIRE_SPEED` and despawns when off-screen or on collision.
  - Fire collision: player loses one life.

### Step 12: Implement Rock Entity
- Create `frontend/src/islands/digdug/engine/entities/Rock.ts` – `Rock` class:
  - A rock at (col, row) checks if the tile directly below is `TUNNEL` or `SKY`; if so, begins falling.
  - Falls at `ROCK_FALL_SPEED` px/frame; re-snaps to grid when it hits dirt or bottom.
  - Crushes any enemy or player in its column during fall.
  - Crushes player → lose a life.
  - Score bonus based on depth.

### Step 13: Implement Core GameEngine
- Create `frontend/src/islands/digdug/engine/GameEngine.ts` – `GameEngine` class:
  - `constructor(canvas: HTMLCanvasElement, onStateChange: (state: GameState) => void)`
  - `start()` / `pause()` / `resume()` / `restart()` methods.
  - `loadSave(save: GameSave)` – restores score/level/lives and regenerates level grid.
  - Private `tick()` method runs each animation frame:
    1. Process input.
    2. Update player.
    3. Update enemies (each enemy's `update()`).
    4. Update rocks (fall logic).
    5. Collision detection in explicit priority order:
       - pump vs enemies
       - rocks vs enemies
       - rocks vs player
       - enemies vs player
       - fire vs player
    6. Resolve terminal state precedence:
       - if lives reached 0 this frame, `GAME_OVER` takes precedence
       - otherwise, if all enemies are dead, enter `LEVEL_COMPLETE`
    7. On `LEVEL_COMPLETE`, transition after short delay to next level or `WIN`.
    8. Call `renderer.render(state)`.
    9. Fire `onStateChange(state)` (throttled to 10fps for React re-renders).
  - Keyboard dispatch: `handleKeyDown(key: string)`.

### Step 14: Implement Canvas Renderer
- Create `frontend/src/islands/digdug/engine/Renderer.ts` – `Renderer` class:
  - `constructor(ctx: CanvasRenderingContext2D)`
  - `render(state: GameState): void`:
    - **Background**: black sky row, brown/dark-brown dirt tiles (color varies by row depth), tunnel tiles are black.
    - **Rocks**: grey rectangles with a slight rounded edge.
    - **Player (Taizo Hori)**: simple geometric shapes in blue/white (helmet, body, drill arm pointing in direction).
    - **Pooka**: red circle/balloon shape.
    - **Fygar**: green dragon shape (rect + tail).
    - **Inflation indicator**: semi-transparent white overlay expanding on enemy based on `inflateCount / maxInflate`.
    - **Pump beam**: cyan line from player in facing direction when pumping.
    - **Fire**: orange/yellow small rect projectile.
    - **Lives**: small player icons at top.
    - **Score / Level**: rendered on canvas HUD at top of canvas.
  - All graphics are simple geometric primitives (no images needed).

### Step 15: Create React Hooks
- Create `frontend/src/islands/digdug/hooks/useKeyboard.ts`:
  - Attaches `keydown`/`keyup` listeners to `window`.
  - Exports a ref-based `InputState` object: `{ up, down, left, right, pump, pause, restart }`.
  - Supports arrow keys and WASD for movement, Space/Z for pump, P for pause, R for restart, Escape for pause.
  - Uses `useEffect` cleanup to remove listeners on unmount.
  - Call `event.preventDefault()` for gameplay keys while `/game` is active to avoid page scroll side effects.
  - If multiple direction keys are pressed, process only one direction per frame (deterministic priority: Up, Down, Left, Right).
- Create `frontend/src/islands/digdug/hooks/useGameSaves.ts`:
  - `saves: GameSave[]` state.
  - `fetchSaves()`, `saveTo(slot: number, data: GameSaveCreate)`, `loadFrom(slot: number)`, `deleteSave(slot: number)` async functions.
  - Calls `/api/game/saves` endpoints.

### Step 16: Create React UI Components
- Create `frontend/src/islands/digdug/components/GameHUD.tsx`:
  - Renders score, high score, level, lives as a styled `<div>` overlay positioned absolutely above the canvas wrapper.
  - Uses Tailwind: dark background, retro font (`font-mono`).
- Create `frontend/src/islands/digdug/components/PauseOverlay.tsx`:
  - Shown when `status === PAUSED`.
  - "PAUSED" heading, then buttons: **Resume** (P), **Restart** (R), **Save Game**, **Quit** (back to `/`).
  - `onResume`, `onRestart`, `onSave`, `onQuit` callbacks.
- Create `frontend/src/islands/digdug/components/SaveLoadModal.tsx`:
  - Modal dialog with 3 save slot cards.
  - Each card shows: slot number, level, score, date (or "Empty").
  - Buttons: **Save Here** (overwrites) and **Load** (disabled if empty).
  - Calls `useGameSaves` hook functions.
  - `onClose` callback.

### Step 17: Create Main DigDugGame Component
- Create `frontend/src/islands/digdug/DigDugGame.tsx`:
  - Renders `<canvas>` element and positions React overlays with `relative`/`absolute` Tailwind classes.
  - `useRef` for canvas; `useEffect` to instantiate `GameEngine` and attach keyboard input.
  - `useState` for `gameState` (score, level, lives, status) received via `onStateChange` callback from engine.
  - `useState` for `showSaveModal: boolean`.
  - Keyboard shortcut: `P` → `engine.pause()/resume()`, `R` → `engine.restart()`.
  - Conditionally renders `<PauseOverlay>` and `<SaveLoadModal>`.
  - On mount, fetches saves and computes `initialHighScore = max(saved.high_score)` (default 0 when no saves).
  - Seed the engine's initial high score using that value.
  - On unmount, cancels animation frame.
  - "How to Play" section below canvas explaining controls.

### Step 18: Create Island Mount Entry Point
- Create `frontend/src/islands/digdug/index.tsx`:
  ```tsx
  import { createRoot } from 'react-dom/client'
  import { DigDugGame } from './DigDugGame'

  export function mount(element: HTMLElement, _props: unknown): void {
    element.innerHTML = ''
    const root = createRoot(element)
    root.render(<DigDugGame />)
  }
  ```
- Register in `frontend/src/main.ts` islandRegistry:
  ```typescript
  digdug: () => import('./islands/digdug'),
  ```

### Step 19: Write Backend Tests
- Create `tests/test_game.py`:
  - `TestGamePage`: `test_game_page_returns_html`, `test_game_page_contains_island_mount`.
  - `TestGameSaveAPI`:
    - `test_list_saves_empty` → `GET /api/game/saves` returns `[]`.
    - `test_create_save` → `POST /api/game/saves` with valid payload returns 200.
    - `test_update_save_same_slot` → second POST to same slot overwrites.
    - `test_invalid_slot_number` → slot 0 or 4 returns 400 (validation error format consistent with existing API style).
    - `test_delete_save` → `DELETE /api/game/saves/1` returns 204.
    - `test_delete_nonexistent_save` → returns 404.
    - `test_saves_ordered_by_slot_number`.

### Step 20: Write Frontend Unit Tests
- Create `frontend/tests/islands/digdug/GameEngine.test.ts`:
  - `test: player digs dirt tile on movement` – mock canvas, verify tile type changes to TUNNEL.
  - `test: enemy dies after max inflations` – set `inflateCount` to max, verify state becomes DEAD.
  - `test: score increases on pump kill` – simulate kill, check score delta = SCORE_PUMP_KILL.
  - `test: rock falls when tunnel below` – set tile below rock to TUNNEL, call update, verify `falling = true`.
  - `test: level increments when all enemies dead`.
  - `test: lives decrement on player death`.
- Create `frontend/tests/islands/digdug/DigDugGame.test.tsx`:
  - `test: renders canvas element`.
  - `test: renders HUD with initial score 0`.
  - `test: shows pause overlay when status is PAUSED`.
  - `test: shows save modal when save button clicked`.

### Step 21: Run All Validation Commands
- Run `script/test` to confirm all pytest + vitest pass.
- Run `script/typecheck` to confirm mypy + tsc report no errors.
- Run `script/lint` to confirm flake8 + eslint are clean.
- Run `script/test-e2e` to confirm Playwright E2E tests pass.

---

## Testing Strategy

### Unit Tests
- **Backend (pytest)**: All 8 game save API test cases covering CRUD, validation, ordering.
- **Frontend (vitest)**: Game engine logic (digging, scoring, collision, death, level transitions) and React component rendering (canvas present, HUD visible, overlays conditional).

### Edge Cases
- Saving to a slot that already has data (upsert, not duplicate insert).
- Loading a save from slot while game is in progress (engine restores state cleanly).
- Deleting a save that doesn't exist (404 response).
- Slot number validation (only 1, 2, 3 are valid).
- Rock falls on player and last enemy simultaneously (game over takes precedence).
- Enemy pump starts deflating if player stops pumping before full inflation.
- Canvas resize / responsive behavior (canvas uses fixed pixel dimensions, centered by CSS).
- Multiple rocks falling in same column (each rock independent).
- Level 10 completion (game shows WIN state, saves high score).
- Keyboard events not leaking outside game island (cleanup on unmount).

---

## Acceptance Criteria

1. The home page includes a visible link or button to open `/game`.
1. Navigating to `/game` renders a page titled "Dig Dug" with a canvas element visible.
2. Arrow keys and WASD move the player character in the corresponding direction, digging through dirt tiles.
3. Holding `Space` inflates the nearest enemy in the facing direction; releasing slowly deflates it; holding until full kills the enemy.
4. Score increments by 200 per pump kill, 400 per rock kill.
5. Player starts with 3 lives; touching an enemy or its fire projectile decrements lives.
6. When all enemies on a level are destroyed, the level number increments and a new grid is generated.
7. Pressing `P` or `Escape` pauses the game and shows the pause overlay.
8. Pressing `P` again or clicking **Resume** unpauses the game.
9. Pressing `R` restarts the game from level 1 with 3 lives and score 0.
10. The HUD always shows current score, high score, level, and remaining lives.
11. Opening the save modal (via pause overlay's **Save Game** button) shows 3 slot cards.
12. Clicking **Save Here** on a slot persists the current score/level/lives to `POST /api/game/saves` and the slot card updates.
13. Clicking **Load** on a populated slot calls `GET /api/game/saves`, restores score/level/lives in the engine.
14. Saved games persist across page reloads (data comes from PostgreSQL).
15. `DELETE /api/game/saves/<slot>` removes the save; the card reverts to "Empty".
16. All existing pytest tests still pass.
17. All existing Playwright E2E tests still pass.
18. `script/typecheck` and `script/lint` complete with zero errors.

---

## Validation Commands
```bash
# Backend tests (includes game save API tests)
pytest tests/ -v

# Frontend unit tests (includes engine + component tests)
cd frontend && npm test

# Type checking (backend + frontend)
script/typecheck

# Linting (backend + frontend)
script/lint

# End-to-end tests (includes digdug.spec.ts)
script/test-e2e

# Full suite shortcut
script/test
```

---

## Notes

- **No external game assets required** – all visuals are geometric primitives drawn on Canvas 2D. This avoids any copyright issues with original Dig Dug artwork.
- **No new npm dependencies** – the game engine is pure TypeScript using the browser Canvas API and `requestAnimationFrame`. React is already available.
- **No new Python packages** – uses existing SQLAlchemy, Flask, Pydantic, Alembic.
- **Canvas dimensions**: Fixed at 560×480px (14 cols × 40px, 12 rows × 40px). Centering is handled via Tailwind `flex justify-center`.
- **Game loop target**: 60fps via `requestAnimationFrame`. Enemy AI and physics are frame-count based so behavior is deterministic.
- **Save granularity**: Saves capture score/level/lives at save time, not mid-level board state. The board is regenerated from the level number on load. This keeps the save format simple.
- **High score**: Tracked in-memory during session and written to the save slot. On load, the engine seeds `highScore` from the best existing save slot.
- **Accessibility**: The `<canvas>` element should include `aria-label="Dig Dug game"`. A text-based "How to Play" section beneath the canvas provides context.
- **Mobile**: Keyboard-only controls mean the game is desktop-first. A future enhancement could add on-screen D-pad buttons.
- **Security**: `slot_number` is validated server-side (1–3) to prevent arbitrary slot creation.
