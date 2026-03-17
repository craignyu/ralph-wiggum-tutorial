import {
  Direction, TileType, PLAYER_SPEED, TILE_SIZE,
  CANVAS_WIDTH, CANVAS_HEIGHT, GRID_COLS, GRID_ROWS,
  PUMP_RANGE, PUMP_HOLD_FRAMES,
} from '../constants'
import type { PlayerState, InputState } from '../types'

export class Player {
  state: PlayerState

  constructor(col: number, row: number) {
    this.state = {
      pos: { x: col * TILE_SIZE, y: row * TILE_SIZE },
      dir: Direction.RIGHT,
      digging: false,
      pumping: false,
      pumpCharge: 0,
      alive: true,
    }
  }

  reset(col: number, row: number): void {
    this.state.pos = { x: col * TILE_SIZE, y: row * TILE_SIZE }
    this.state.dir = Direction.RIGHT
    this.state.digging = false
    this.state.pumping = false
    this.state.pumpCharge = 0
    this.state.alive = true
  }

  update(input: InputState, grid: TileType[][]): void {
    if (!this.state.alive) return

    // Handle pump
    if (input.pump) {
      this.state.pumping = true
      this.state.pumpCharge = Math.min(this.state.pumpCharge + 1, PUMP_HOLD_FRAMES)
      return // No movement while pumping
    } else {
      if (this.state.pumping) {
        this.state.pumping = false
        this.state.pumpCharge = 0
      }
    }

    // Determine direction (priority: Up > Down > Left > Right)
    let dir = Direction.NONE
    if (input.up) dir = Direction.UP
    else if (input.down) dir = Direction.DOWN
    else if (input.left) dir = Direction.LEFT
    else if (input.right) dir = Direction.RIGHT

    if (dir === Direction.NONE) return
    this.state.dir = dir

    // Calculate new position
    let nx = this.state.pos.x
    let ny = this.state.pos.y

    switch (dir) {
      case Direction.UP: ny -= PLAYER_SPEED; break
      case Direction.DOWN: ny += PLAYER_SPEED; break
      case Direction.LEFT: nx -= PLAYER_SPEED; break
      case Direction.RIGHT: nx += PLAYER_SPEED; break
    }

    // Clamp to canvas bounds
    nx = Math.max(0, Math.min(nx, CANVAS_WIDTH - TILE_SIZE))
    ny = Math.max(0, Math.min(ny, CANVAS_HEIGHT - TILE_SIZE))

    // Check if we can move to this position
    const newGridRow = Math.floor(ny / TILE_SIZE)
    const newGridCol = Math.floor(nx / TILE_SIZE)
    if (newGridRow === 0 && this.getGridRow() > 0) {
      // Trying to go from underground to sky: only if tunnel
      if (newGridCol >= 0 && newGridCol < GRID_COLS &&
          grid[0] && grid[0][newGridCol] !== TileType.TUNNEL &&
          grid[0][newGridCol] !== TileType.SKY) {
        return
      }
    }

    this.state.pos.x = nx
    this.state.pos.y = ny

    // Carve tunnel (dig) at current position
    const gridRow = this.getGridRow()
    const gridCol = this.getGridCol()
    if (gridRow > 0 && gridRow <= GRID_ROWS &&
        gridCol >= 0 && gridCol < GRID_COLS) {
      if (grid[gridRow] && grid[gridRow][gridCol] === TileType.DIRT) {
        grid[gridRow][gridCol] = TileType.TUNNEL
        this.state.digging = true
      } else {
        this.state.digging = false
      }
    }
  }

  getGridRow(): number {
    return Math.floor((this.state.pos.y + TILE_SIZE / 2) / TILE_SIZE)
  }

  getGridCol(): number {
    return Math.floor((this.state.pos.x + TILE_SIZE / 2) / TILE_SIZE)
  }

  getPumpHitbox(): { x: number; y: number; w: number; h: number } | null {
    if (!this.state.pumping) return null
    const { x, y } = this.state.pos
    switch (this.state.dir) {
      case Direction.RIGHT:
        return { x: x + TILE_SIZE, y: y, w: PUMP_RANGE, h: TILE_SIZE }
      case Direction.LEFT:
        return { x: x - PUMP_RANGE, y: y, w: PUMP_RANGE, h: TILE_SIZE }
      case Direction.DOWN:
        return { x: x, y: y + TILE_SIZE, w: TILE_SIZE, h: PUMP_RANGE }
      case Direction.UP:
        return { x: x, y: y - PUMP_RANGE, w: TILE_SIZE, h: PUMP_RANGE }
      default:
        return null
    }
  }
}
