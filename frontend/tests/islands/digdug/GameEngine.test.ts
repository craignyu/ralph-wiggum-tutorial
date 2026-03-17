import { describe, it, expect } from 'vitest'
import { TileType, EnemyState, PUMP_HOLD_FRAMES } from '@/islands/digdug/engine/constants'
import { generateLevel } from '@/islands/digdug/engine/Level'
import { Player } from '@/islands/digdug/engine/entities/Player'
import { Pooka } from '@/islands/digdug/engine/entities/Pooka'
import { Rock } from '@/islands/digdug/engine/entities/Rock'

describe('Level Generator', () => {
  it('generates deterministic levels', () => {
    const level1a = generateLevel(1)
    const level1b = generateLevel(1)
    expect(level1a.grid).toEqual(level1b.grid)
    expect(level1a.enemies).toEqual(level1b.enemies)
    expect(level1a.rocks).toEqual(level1b.rocks)
  })

  it('has sky in row 0', () => {
    const level = generateLevel(1)
    for (let col = 0; col < level.grid[0].length; col++) {
      expect(level.grid[0][col]).toBe(TileType.SKY)
    }
  })

  it('increases enemy count with level', () => {
    const level1 = generateLevel(1)
    const level5 = generateLevel(5)
    expect(level5.enemies.length).toBeGreaterThan(level1.enemies.length)
  })
})

describe('Player', () => {
  it('digs dirt tile on movement', () => {
    const level = generateLevel(1)
    const player = new Player(7, 1) // Start in tunnel
    const input = {
      up: false, down: true, left: false, right: false,
      pump: false, pause: false, restart: false,
    }
    // Move down into dirt
    for (let i = 0; i < 20; i++) {
      player.update(input, level.grid)
    }
    // Some tile should now be tunnel
    const row = player.getGridRow()
    const col = player.getGridCol()
    expect(level.grid[row][col]).toBe(TileType.TUNNEL)
  })

  it('cannot move while pumping', () => {
    const level = generateLevel(1)
    const player = new Player(7, 0)
    const startX = player.state.pos.x
    const input = {
      up: false, down: false, left: false, right: true,
      pump: true, pause: false, restart: false,
    }
    player.update(input, level.grid)
    expect(player.state.pos.x).toBe(startX)
    expect(player.state.pumping).toBe(true)
  })
})

describe('Enemy', () => {
  it('dies after max inflations', () => {
    const enemy = new Pooka(0, 5, 5)
    for (let i = 0; i < PUMP_HOLD_FRAMES; i++) {
      enemy.startInflating()
    }
    expect(enemy.entity.inflateCount).toBeGreaterThanOrEqual(PUMP_HOLD_FRAMES)
    enemy.kill()
    expect(enemy.entity.state).toBe(EnemyState.DEAD)
  })
})

describe('Rock', () => {
  it('falls when tunnel below', () => {
    const level = generateLevel(1)
    const rock = new Rock(0, 3, 2)
    // Carve tunnel below the rock
    level.grid[3][3] = TileType.TUNNEL
    // Update multiple times for wobble
    for (let i = 0; i < 5; i++) {
      rock.update(level.grid)
    }
    expect(rock.state.falling).toBe(true)
  })

  it('does not fall when dirt below', () => {
    const level = generateLevel(1)
    const rock = new Rock(0, 5, 5)
    // Ensure dirt below
    level.grid[6][5] = TileType.DIRT
    rock.update(level.grid)
    expect(rock.state.falling).toBe(false)
  })
})
