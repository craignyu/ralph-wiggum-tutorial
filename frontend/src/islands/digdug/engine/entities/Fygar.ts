import {
  EnemyType, Direction, FIRE_COOLDOWN, FIRE_RANGE, TILE_SIZE,
} from '../constants'
import { Enemy } from './Enemy'
import type { Position, FireProjectile } from '../types'

/**
 * Fygar enemy - breathes fire horizontally toward the player.
 */
export class Fygar extends Enemy {
  constructor(id: number, col: number, row: number) {
    super(id, EnemyType.FYGAR, col, row)
    this.entity.fireCooldown = FIRE_COOLDOWN
  }

  updateFire(playerPos: Position): FireProjectile | null {
    if (this.entity.state !== 'WALKING') return null
    this.entity.fireCooldown--
    if (this.entity.fireCooldown > 0) return null

    // Check if player is within range horizontally and roughly same row
    const dy = Math.abs(playerPos.y - this.entity.pos.y)
    if (dy > TILE_SIZE) return null

    const dx = playerPos.x - this.entity.pos.x
    if (Math.abs(dx) > FIRE_RANGE) return null

    // Fire!
    this.entity.fireCooldown = FIRE_COOLDOWN
    const dir = dx > 0 ? Direction.RIGHT : Direction.LEFT
    return {
      pos: {
        x: this.entity.pos.x + (dir === Direction.RIGHT ? TILE_SIZE : -10),
        y: this.entity.pos.y + TILE_SIZE / 2 - 5,
      },
      dir,
      active: true,
    }
  }
}
