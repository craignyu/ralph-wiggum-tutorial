import { TileType, EnemyType, GRID_COLS, GRID_ROWS } from './constants'
import type { EnemySpawnDef, RockDef } from './types'

export interface LevelData {
  grid: TileType[][]
  enemies: EnemySpawnDef[]
  rocks: RockDef[]
  playerCol: number
  playerRow: number
}

/**
 * Deterministic level generator. Same levelNum always produces same output.
 * This is critical because save/load regenerates the board from level number.
 */
export function generateLevel(levelNum: number): LevelData {
  // Create grid: row 0 = SKY, rows 1-GRID_ROWS = DIRT
  const grid: TileType[][] = []
  for (let row = 0; row <= GRID_ROWS; row++) {
    const rowData: TileType[] = []
    for (let col = 0; col < GRID_COLS; col++) {
      rowData.push(row === 0 ? TileType.SKY : TileType.DIRT)
    }
    grid.push(rowData)
  }

  // Player spawn: top-center
  const playerCol = 7
  const playerRow = 0

  // Carve starting tunnel from sky down into dirt
  grid[1][playerCol] = TileType.TUNNEL
  grid[2][playerCol] = TileType.TUNNEL
  grid[2][playerCol - 1] = TileType.TUNNEL
  grid[2][playerCol + 1] = TileType.TUNNEL

  // Carve some horizontal tunnels for gameplay variety (deterministic by level)
  const tunnelRows = [4, 6, 8]
  for (const tRow of tunnelRows) {
    if (tRow <= GRID_ROWS) {
      const startCol = (levelNum + tRow) % (GRID_COLS - 4) + 1
      for (let c = startCol; c < startCol + 4 && c < GRID_COLS; c++) {
        grid[tRow][c] = TileType.TUNNEL
      }
    }
  }

  // Rocks: two per level at fixed positions
  const rocks: RockDef[] = [
    { col: 3, row: 2 },
    { col: 10, row: 2 },
  ]

  // Enemy count: 2 + levelNum, capped at 8
  const enemyCount = Math.min(2 + levelNum, 8)
  const enemies: EnemySpawnDef[] = []

  // Distribute enemies across lower rows, deterministic by level
  for (let i = 0; i < enemyCount; i++) {
    // Deeper levels bias toward more Fygar
    const isFygar = i % 2 === 1 || (levelNum >= 5 && i % 3 === 0)
    const type = isFygar ? EnemyType.FYGAR : EnemyType.POOKA

    // Spread enemies across the grid deterministically
    const row = 3 + ((i * 3 + levelNum) % (GRID_ROWS - 3))
    const col = 1 + ((i * 5 + levelNum * 2) % (GRID_COLS - 2))

    // Carve tunnel at spawn point so enemy can move
    if (row <= GRID_ROWS) {
      grid[row][col] = TileType.TUNNEL
      if (col + 1 < GRID_COLS) grid[row][col + 1] = TileType.TUNNEL
    }

    enemies.push({ type, col, row })
  }

  return { grid, enemies, rocks, playerCol, playerRow }
}
