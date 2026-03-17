/** Grid dimensions */
export const GRID_COLS = 14
export const GRID_ROWS = 11
export const TILE_SIZE = 40
export const CANVAS_WIDTH = GRID_COLS * TILE_SIZE // 560
export const CANVAS_HEIGHT = (GRID_ROWS + 1) * TILE_SIZE // 480 (1 sky + 11 dirt rows)

/** Movement speeds (px/frame) */
export const PLAYER_SPEED = 3
export const ENEMY_SPEED = 1.5
export const ROCK_FALL_SPEED = 4
export const FIRE_SPEED = 5

/** Pump mechanics */
export const PUMP_RANGE = TILE_SIZE * 1.5 // 60px
export const PUMP_HOLD_FRAMES = 60

/** Scoring */
export const SCORE_PUMP_KILL = 200
export const SCORE_ROCK_KILL = 400
export const SCORE_ROCK_BONUS = 100
export const SCORE_DEPTH_MULTIPLIER = [1, 2, 3, 4]

/** Gameplay */
export const INITIAL_LIVES = 3
export const MAX_LEVEL = 10
export const GHOST_INTERVAL = 600
export const FIRE_COOLDOWN = 120
export const FIRE_RANGE = TILE_SIZE * 3

export enum TileType {
  SKY = 0,
  DIRT = 1,
  TUNNEL = 2,
  ROCK_SLOT = 3,
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE',
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN',
}

export enum EnemyType {
  POOKA = 'POOKA',
  FYGAR = 'FYGAR',
}

export enum EnemyState {
  WALKING = 'WALKING',
  INFLATING = 'INFLATING',
  DEFLATING = 'DEFLATING',
  DEAD = 'DEAD',
  GHOSTING = 'GHOSTING',
}
