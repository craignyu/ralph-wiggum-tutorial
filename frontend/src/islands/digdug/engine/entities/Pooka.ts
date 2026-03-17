import { EnemyType } from '../constants'
import { Enemy } from './Enemy'

/**
 * Pooka enemy - wanders tunnels, enters ghost mode periodically.
 * No special attack; damage by contact only.
 */
export class Pooka extends Enemy {
  constructor(id: number, col: number, row: number) {
    super(id, EnemyType.POOKA, col, row)
  }
}
