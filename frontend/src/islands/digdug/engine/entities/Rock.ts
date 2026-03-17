import {
  TileType, ROCK_FALL_SPEED, TILE_SIZE, GRID_ROWS,
} from '../constants'
import type { RockState } from '../types'

export class Rock {
  state: RockState

  constructor(id: number, col: number, row: number) {
    this.state = {
      id,
      col,
      row,
      falling: false,
      fallY: row * TILE_SIZE,
      wobbleFrames: 0,
      settled: false,
    }
  }

  update(grid: TileType[][]): void {
    if (this.state.settled) return

    const belowRow = this.state.row + 1
    if (belowRow > GRID_ROWS) {
      this.state.settled = true
      return
    }

    // Check if tile below is open (TUNNEL or SKY)
    const tileBelow = grid[belowRow]?.[this.state.col]
    const isOpen = tileBelow === TileType.TUNNEL || tileBelow === TileType.SKY

    if (isOpen && !this.state.falling) {
      // Start wobble before falling
      this.state.wobbleFrames++
      if (this.state.wobbleFrames >= 3) {
        this.state.falling = true
      }
      return
    }

    if (this.state.falling) {
      this.state.fallY += ROCK_FALL_SPEED

      // Check if we've reached the next grid position
      const nextRow = Math.floor(this.state.fallY / TILE_SIZE)
      if (nextRow > this.state.row) {
        this.state.row = nextRow

        // Check if next tile below is solid or at bottom
        if (nextRow >= GRID_ROWS) {
          this.state.falling = false
          this.state.settled = true
          return
        }

        const nextBelow = grid[nextRow + 1]?.[this.state.col]
        if (nextBelow === TileType.DIRT || nextBelow === TileType.ROCK_SLOT || nextBelow === undefined) {
          this.state.falling = false
          this.state.settled = true
          this.state.fallY = nextRow * TILE_SIZE
        }
      }
    }
  }

  getPixelPos(): { x: number; y: number } {
    return {
      x: this.state.col * TILE_SIZE,
      y: this.state.falling ? this.state.fallY : this.state.row * TILE_SIZE,
    }
  }
}
