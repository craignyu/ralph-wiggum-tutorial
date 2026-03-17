import {
  Direction, TileType, EnemyState, EnemyType,
  ENEMY_SPEED, TILE_SIZE, GRID_COLS, GRID_ROWS,
  CANVAS_WIDTH, CANVAS_HEIGHT, GHOST_INTERVAL,
} from '../constants'
import type { EnemyEntity, Position } from '../types'

export class Enemy {
  entity: EnemyEntity
  private dirChangeTimer: number = 0

  constructor(id: number, type: EnemyType, col: number, row: number) {
    this.entity = {
      id,
      type,
      pos: { x: col * TILE_SIZE, y: row * TILE_SIZE },
      dir: Direction.LEFT,
      state: EnemyState.WALKING,
      inflateCount: 0,
      ghostTimer: Math.floor(GHOST_INTERVAL * 0.5 + id * 100),
      fireCooldown: 0,
    }
  }

  update(grid: TileType[][], playerPos: Position): void {
    if (this.entity.state === EnemyState.DEAD) return

    // Handle inflation states
    if (this.entity.state === EnemyState.INFLATING) {
      return // Frozen while being inflated
    }

    if (this.entity.state === EnemyState.DEFLATING) {
      this.entity.inflateCount -= 0.5
      if (this.entity.inflateCount <= 0) {
        this.entity.inflateCount = 0
        this.entity.state = EnemyState.WALKING
      }
      return
    }

    // Ghost timer
    this.entity.ghostTimer--
    if (this.entity.ghostTimer <= 0 && this.entity.state === EnemyState.WALKING) {
      this.entity.state = EnemyState.GHOSTING
      this.entity.ghostTimer = GHOST_INTERVAL
    }

    if (this.entity.state === EnemyState.GHOSTING) {
      this.moveTowardPlayer(playerPos)
      // Return to walking when reaching a tunnel
      const row = this.getGridRow()
      const col = this.getGridCol()
      if (row >= 0 && row <= GRID_ROWS && col >= 0 && col < GRID_COLS) {
        if (grid[row] && grid[row][col] === TileType.TUNNEL) {
          this.dirChangeTimer++
          if (this.dirChangeTimer > 30) {
            this.entity.state = EnemyState.WALKING
            this.dirChangeTimer = 0
          }
        }
      }
      return
    }

    // Normal walking: move toward player through tunnels
    this.moveTowardPlayer(playerPos)

    // Clamp
    this.entity.pos.x = Math.max(0, Math.min(this.entity.pos.x, CANVAS_WIDTH - TILE_SIZE))
    this.entity.pos.y = Math.max(TILE_SIZE, Math.min(this.entity.pos.y, CANVAS_HEIGHT - TILE_SIZE))
  }

  private moveTowardPlayer(playerPos: Position): void {
    const dx = playerPos.x - this.entity.pos.x
    const dy = playerPos.y - this.entity.pos.y
    const speed = ENEMY_SPEED

    // Prefer horizontal or vertical based on distance
    if (Math.abs(dx) > Math.abs(dy)) {
      this.entity.dir = dx > 0 ? Direction.RIGHT : Direction.LEFT
      this.entity.pos.x += dx > 0 ? speed : -speed
    } else {
      this.entity.dir = dy > 0 ? Direction.DOWN : Direction.UP
      this.entity.pos.y += dy > 0 ? speed : -speed
    }
  }

  getGridRow(): number {
    return Math.floor((this.entity.pos.y + TILE_SIZE / 2) / TILE_SIZE)
  }

  getGridCol(): number {
    return Math.floor((this.entity.pos.x + TILE_SIZE / 2) / TILE_SIZE)
  }

  startInflating(): void {
    if (this.entity.state === EnemyState.DEAD) return
    this.entity.state = EnemyState.INFLATING
    this.entity.inflateCount++
  }

  releaseInflation(): void {
    if (this.entity.state === EnemyState.INFLATING) {
      this.entity.state = EnemyState.DEFLATING
    }
  }

  kill(): void {
    this.entity.state = EnemyState.DEAD
  }
}
