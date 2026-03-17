import {
  TileType, Direction, GameStatus, EnemyType, EnemyState,
} from './constants'

export interface Position {
  x: number
  y: number
}

export interface PlayerState {
  pos: Position
  dir: Direction
  digging: boolean
  pumping: boolean
  pumpCharge: number
  alive: boolean
}

export interface EnemyEntity {
  id: number
  type: EnemyType
  pos: Position
  dir: Direction
  state: EnemyState
  inflateCount: number
  ghostTimer: number
  fireCooldown: number
}

export interface RockState {
  id: number
  col: number
  row: number
  falling: boolean
  fallY: number
  wobbleFrames: number
  settled: boolean
}

export interface FireProjectile {
  pos: Position
  dir: Direction
  active: boolean
}

export interface GameState {
  status: GameStatus
  score: number
  highScore: number
  level: number
  lives: number
  grid: TileType[][]
  player: PlayerState
  enemies: EnemyEntity[]
  rocks: RockState[]
  fires: FireProjectile[]
  frame: number
}

export interface InputState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
  pump: boolean
  pause: boolean
  restart: boolean
}

export interface EnemySpawnDef {
  type: EnemyType
  col: number
  row: number
}

export interface RockDef {
  col: number
  row: number
}

/**
 * GameStatus transitions:
 * IDLE → PLAYING (start)
 * PLAYING ↔ PAUSED (P/Escape)
 * PLAYING → LEVEL_COMPLETE (all enemies dead)
 * LEVEL_COMPLETE → PLAYING (next level after delay)
 * LEVEL_COMPLETE → WIN (level === MAX_LEVEL)
 * PLAYING → GAME_OVER (lives === 0)
 */
