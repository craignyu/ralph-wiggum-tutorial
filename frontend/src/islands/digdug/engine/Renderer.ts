import {
  TileType, Direction, EnemyType, EnemyState, GameStatus,
  TILE_SIZE, GRID_COLS, GRID_ROWS, CANVAS_WIDTH, CANVAS_HEIGHT,
  PUMP_HOLD_FRAMES,
} from './constants'
import type { GameState } from './types'

const DIRT_COLORS = [
  '#8B4513', '#7B3F10', '#6B360E', '#5C2D0C',
  '#4D250A', '#3E1D08', '#2F1506', '#200E04',
]
const SKY_COLOR = '#000000'
const TUNNEL_COLOR = '#1a1a1a'
const PLAYER_COLOR = '#4488FF'
const PLAYER_HELMET = '#FFFFFF'
const POOKA_COLOR = '#FF4444'
const FYGAR_COLOR = '#44CC44'
const ROCK_COLOR = '#888888'
const PUMP_COLOR = '#00FFFF'
const FIRE_COLOR = '#FF8800'

export class Renderer {
  private ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  render(state: GameState): void {
    const { ctx } = this
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.drawGrid(state.grid)
    this.drawRocks(state)
    this.drawFires(state)
    this.drawEnemies(state)
    this.drawPlayer(state)
    this.drawPumpBeam(state)
    this.drawHUD(state)

    if (state.status === GameStatus.GAME_OVER) {
      this.drawOverlayText('GAME OVER', '#FF0000')
    } else if (state.status === GameStatus.WIN) {
      this.drawOverlayText('YOU WIN!', '#FFD700')
    } else if (state.status === GameStatus.LEVEL_COMPLETE) {
      this.drawOverlayText(`LEVEL ${state.level} COMPLETE!`, '#00FF00')
    }
  }

  private drawGrid(grid: TileType[][]): void {
    const { ctx } = this
    for (let row = 0; row <= GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const tile = grid[row]?.[col]
        const x = col * TILE_SIZE
        const y = row * TILE_SIZE

        if (tile === TileType.SKY) {
          ctx.fillStyle = SKY_COLOR
        } else if (tile === TileType.TUNNEL) {
          ctx.fillStyle = TUNNEL_COLOR
        } else {
          // Dirt color varies by depth
          const depthIndex = Math.min(Math.floor((row - 1) / 1.5), DIRT_COLORS.length - 1)
          ctx.fillStyle = DIRT_COLORS[Math.max(0, depthIndex)]
        }
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
      }
    }
  }

  private drawRocks(state: GameState): void {
    const { ctx } = this
    for (const rock of state.rocks) {
      const x = rock.col * TILE_SIZE
      const y = rock.falling ? rock.fallY : rock.row * TILE_SIZE
      ctx.fillStyle = ROCK_COLOR
      ctx.beginPath()
      const r = 4
      ctx.roundRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, r)
      ctx.fill()
      // Rock texture lines
      ctx.strokeStyle = '#666666'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + 8, y + 10)
      ctx.lineTo(x + TILE_SIZE - 8, y + 15)
      ctx.moveTo(x + 6, y + 22)
      ctx.lineTo(x + TILE_SIZE - 6, y + 25)
      ctx.stroke()
    }
  }

  private drawPlayer(state: GameState): void {
    if (!state.player.alive) return
    const { ctx } = this
    const { x, y } = state.player.pos

    // Body
    ctx.fillStyle = PLAYER_COLOR
    ctx.fillRect(x + 8, y + 12, 24, 20)

    // Helmet
    ctx.fillStyle = PLAYER_HELMET
    ctx.beginPath()
    ctx.arc(x + TILE_SIZE / 2, y + 12, 10, Math.PI, 0)
    ctx.fill()

    // Drill arm in facing direction
    ctx.fillStyle = '#CCCCCC'
    const cx = x + TILE_SIZE / 2
    const cy = y + 20
    switch (state.player.dir) {
      case Direction.RIGHT:
        ctx.fillRect(x + 28, cy - 3, 12, 6)
        break
      case Direction.LEFT:
        ctx.fillRect(x - 4, cy - 3, 12, 6)
        break
      case Direction.DOWN:
        ctx.fillRect(cx - 3, y + 30, 6, 12)
        break
      case Direction.UP:
        ctx.fillRect(cx - 3, y - 4, 6, 12)
        break
    }

    // Legs
    ctx.fillStyle = PLAYER_COLOR
    ctx.fillRect(x + 12, y + 30, 6, 8)
    ctx.fillRect(x + 22, y + 30, 6, 8)
  }

  private drawEnemies(state: GameState): void {
    const { ctx } = this
    for (const enemy of state.enemies) {
      if (enemy.state === EnemyState.DEAD) continue

      const { x, y } = enemy.pos

      if (enemy.type === EnemyType.POOKA) {
        // Red balloon shape
        ctx.fillStyle = POOKA_COLOR
        ctx.beginPath()
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2 - 4, 0, Math.PI * 2)
        ctx.fill()
        // Eyes
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(x + 14, y + 14, 4, 0, Math.PI * 2)
        ctx.arc(x + 26, y + 14, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(x + 15, y + 14, 2, 0, Math.PI * 2)
        ctx.arc(x + 27, y + 14, 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Fygar: green dragon
        ctx.fillStyle = FYGAR_COLOR
        ctx.fillRect(x + 4, y + 8, 28, 20)
        // Head
        ctx.fillRect(x + 24, y + 4, 12, 16)
        // Tail
        ctx.beginPath()
        ctx.moveTo(x + 4, y + 12)
        ctx.lineTo(x - 4, y + 8)
        ctx.lineTo(x + 4, y + 24)
        ctx.fill()
        // Eye
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(x + 30, y + 12, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(x + 31, y + 12, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Inflation overlay
      if (enemy.state === EnemyState.INFLATING || enemy.state === EnemyState.DEFLATING) {
        const inflation = enemy.inflateCount / PUMP_HOLD_FRAMES
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + inflation * 0.4})`
        const expand = inflation * 10
        ctx.beginPath()
        ctx.arc(
          x + TILE_SIZE / 2,
          y + TILE_SIZE / 2,
          TILE_SIZE / 2 - 2 + expand,
          0, Math.PI * 2
        )
        ctx.fill()
      }

      // Ghost mode indicator
      if (enemy.state === EnemyState.GHOSTING) {
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        ctx.setLineDash([])
      }
    }
  }

  private drawPumpBeam(state: GameState): void {
    if (!state.player.pumping) return
    const { ctx } = this
    const { x, y } = state.player.pos
    const charge = state.player.pumpCharge

    ctx.strokeStyle = PUMP_COLOR
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.7

    const cx = x + TILE_SIZE / 2
    const cy = y + TILE_SIZE / 2
    const len = 20 + charge

    ctx.beginPath()
    switch (state.player.dir) {
      case Direction.RIGHT:
        ctx.moveTo(x + TILE_SIZE, cy)
        ctx.lineTo(x + TILE_SIZE + len, cy)
        break
      case Direction.LEFT:
        ctx.moveTo(x, cy)
        ctx.lineTo(x - len, cy)
        break
      case Direction.DOWN:
        ctx.moveTo(cx, y + TILE_SIZE)
        ctx.lineTo(cx, y + TILE_SIZE + len)
        break
      case Direction.UP:
        ctx.moveTo(cx, y)
        ctx.lineTo(cx, y - len)
        break
    }
    ctx.stroke()
    ctx.globalAlpha = 1.0
  }

  private drawFires(state: GameState): void {
    const { ctx } = this
    for (const fire of state.fires) {
      if (!fire.active) continue
      ctx.fillStyle = FIRE_COLOR
      ctx.fillRect(fire.pos.x, fire.pos.y, 12, 10)
      // Flame effect
      ctx.fillStyle = '#FFCC00'
      ctx.fillRect(fire.pos.x + 2, fire.pos.y + 2, 8, 6)
    }
  }

  private drawHUD(state: GameState): void {
    const { ctx } = this
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '14px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`SCORE: ${state.score}`, 10, 16)
    ctx.textAlign = 'center'
    ctx.fillText(`LEVEL ${state.level}`, CANVAS_WIDTH / 2, 16)
    ctx.textAlign = 'right'
    ctx.fillText(`HI: ${state.highScore}`, CANVAS_WIDTH - 10, 16)

    // Draw lives as small player icons
    ctx.textAlign = 'left'
    for (let i = 0; i < state.lives; i++) {
      ctx.fillStyle = PLAYER_COLOR
      ctx.fillRect(10 + i * 18, CANVAS_HEIGHT - 18, 12, 12)
    }
  }

  private drawOverlayText(text: string, color: string): void {
    const { ctx } = this
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, CANVAS_HEIGHT / 2 - 40, CANVAS_WIDTH, 80)
    ctx.fillStyle = color
    ctx.font = 'bold 32px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10)
  }
}
