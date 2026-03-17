import {
  GameStatus, EnemyState, EnemyType, Direction,
  TILE_SIZE, CANVAS_WIDTH, GRID_COLS, GRID_ROWS,
  PUMP_HOLD_FRAMES, SCORE_PUMP_KILL, SCORE_ROCK_KILL, SCORE_ROCK_BONUS,
  SCORE_DEPTH_MULTIPLIER, INITIAL_LIVES, MAX_LEVEL, FIRE_SPEED, TileType,
} from './constants'
import type { GameState, InputState } from './types'
import { Renderer } from './Renderer'
import { generateLevel } from './Level'
import { Player } from './entities/Player'
import { Enemy } from './entities/Enemy'
import { Pooka } from './entities/Pooka'
import { Fygar } from './entities/Fygar'
import { Rock } from './entities/Rock'

export class GameEngine {
  private renderer: Renderer
  private onStateChange: (state: GameState) => void
  private animFrameId: number = 0
  private state: GameState
  private player: Player
  private enemies: Enemy[] = []
  private rocks: Rock[] = []
  private input: InputState
  private inputRef: { current: InputState } | null = null
  private levelTransitionTimer: number = 0
  private playerRespawnTimer: number = 0

  constructor(canvas: HTMLCanvasElement, onStateChange: (state: GameState) => void) {
    const ctx = canvas.getContext('2d')!
    this.renderer = new Renderer(ctx)
    this.onStateChange = onStateChange

    this.input = {
      up: false, down: false, left: false, right: false,
      pump: false, pause: false, restart: false,
    }

    this.player = new Player(7, 0)

    this.state = {
      status: GameStatus.IDLE,
      score: 0,
      highScore: 0,
      level: 1,
      lives: INITIAL_LIVES,
      grid: [],
      player: this.player.state,
      enemies: [],
      rocks: [],
      fires: [],
      frame: 0,
    }
  }

  setInputRef(ref: { current: InputState }): void {
    this.inputRef = ref
  }

  start(): void {
    this.state.status = GameStatus.PLAYING
    this.loadLevel(this.state.level)
    this.tick()
  }

  pause(): void {
    if (this.state.status === GameStatus.PLAYING) {
      this.state.status = GameStatus.PAUSED
      cancelAnimationFrame(this.animFrameId)
      this.emitState()
    }
  }

  resume(): void {
    if (this.state.status === GameStatus.PAUSED) {
      this.state.status = GameStatus.PLAYING
      this.tick()
    }
  }

  restart(): void {
    cancelAnimationFrame(this.animFrameId)
    this.state.score = 0
    this.state.level = 1
    this.state.lives = INITIAL_LIVES
    this.state.status = GameStatus.PLAYING
    this.state.fires = []
    this.state.frame = 0
    this.levelTransitionTimer = 0
    this.playerRespawnTimer = 0
    this.loadLevel(1)
    this.tick()
  }

  loadSave(save: { score: number; highScore: number; level: number; lives: number }): void {
    cancelAnimationFrame(this.animFrameId)
    this.state.score = save.score
    this.state.highScore = save.highScore
    this.state.level = save.level
    this.state.lives = save.lives
    this.state.status = GameStatus.PLAYING
    this.state.fires = []
    this.state.frame = 0
    this.levelTransitionTimer = 0
    this.playerRespawnTimer = 0
    this.loadLevel(save.level)
    this.tick()
  }

  destroy(): void {
    cancelAnimationFrame(this.animFrameId)
  }

  getState(): GameState {
    return { ...this.state }
  }

  private loadLevel(levelNum: number): void {
    const levelData = generateLevel(levelNum)
    this.state.grid = levelData.grid

    this.player.reset(levelData.playerCol, levelData.playerRow)
    this.state.player = this.player.state

    this.enemies = levelData.enemies.map((def, i) => {
      if (def.type === EnemyType.FYGAR) {
        return new Fygar(i, def.col, def.row)
      }
      return new Pooka(i, def.col, def.row)
    })
    this.state.enemies = this.enemies.map(e => e.entity)

    this.rocks = levelData.rocks.map((def, i) => new Rock(i, def.col, def.row))
    this.state.rocks = this.rocks.map(r => r.state)

    this.state.fires = []
  }

  private tick = (): void => {
    if (this.state.status !== GameStatus.PLAYING &&
        this.state.status !== GameStatus.LEVEL_COMPLETE) {
      this.renderer.render(this.state)
      this.emitState()
      return
    }

    // Read input from ref
    if (this.inputRef) {
      this.input = { ...this.inputRef.current }
    }

    this.state.frame++

    if (this.state.status === GameStatus.LEVEL_COMPLETE) {
      this.levelTransitionTimer++
      if (this.levelTransitionTimer >= 120) {
        this.levelTransitionTimer = 0
        if (this.state.level >= MAX_LEVEL) {
          this.state.status = GameStatus.WIN
        } else {
          this.state.level++
          this.state.status = GameStatus.PLAYING
          this.loadLevel(this.state.level)
        }
      }
      this.renderer.render(this.state)
      this.emitState()
      this.animFrameId = requestAnimationFrame(this.tick)
      return
    }

    // Handle respawn timer
    if (this.playerRespawnTimer > 0) {
      this.playerRespawnTimer--
      if (this.playerRespawnTimer === 0) {
        this.player.state.alive = true
        const levelData = generateLevel(this.state.level)
        this.player.reset(levelData.playerCol, levelData.playerRow)
      }
      this.renderer.render(this.state)
      this.emitState()
      this.animFrameId = requestAnimationFrame(this.tick)
      return
    }

    // 1. Update player
    this.player.update(this.input, this.state.grid)
    this.state.player = this.player.state

    // 2. Update enemies
    for (const enemy of this.enemies) {
      enemy.update(this.state.grid, this.player.state.pos)
      if (enemy instanceof Fygar) {
        const fire = (enemy as Fygar).updateFire(this.player.state.pos)
        if (fire) {
          this.state.fires.push(fire)
        }
      }
    }
    this.state.enemies = this.enemies.map(e => e.entity)

    // 3. Update rocks
    for (const rock of this.rocks) {
      rock.update(this.state.grid)
    }
    this.state.rocks = this.rocks.map(r => r.state)

    // 4. Update fire projectiles
    this.updateFires()

    // 5. Collision detection
    this.detectCollisions()

    // 6. Check terminal states
    if (this.state.lives <= 0) {
      this.state.status = GameStatus.GAME_OVER
      cancelAnimationFrame(this.animFrameId)
      this.renderer.render(this.state)
      this.emitState()
      return
    }

    // All enemies dead → LEVEL_COMPLETE
    const allDead = this.enemies.every(e => e.entity.state === EnemyState.DEAD)
    if (allDead && this.enemies.length > 0) {
      this.state.status = GameStatus.LEVEL_COMPLETE
      this.levelTransitionTimer = 0
    }

    // Update high score
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score
    }

    // Render
    this.renderer.render(this.state)

    // Emit state (throttled to ~10fps)
    if (this.state.frame % 6 === 0) {
      this.emitState()
    }

    this.animFrameId = requestAnimationFrame(this.tick)
  }

  private updateFires(): void {
    for (const fire of this.state.fires) {
      if (!fire.active) continue
      if (fire.dir === Direction.RIGHT) {
        fire.pos.x += FIRE_SPEED
      } else {
        fire.pos.x -= FIRE_SPEED
      }
      // Despawn if off canvas
      if (fire.pos.x < 0 || fire.pos.x > CANVAS_WIDTH) {
        fire.active = false
      }
      // Despawn if hitting dirt
      const row = Math.floor(fire.pos.y / TILE_SIZE)
      const col = Math.floor(fire.pos.x / TILE_SIZE)
      if (row >= 0 && row <= GRID_ROWS && col >= 0 && col < GRID_COLS) {
        if (this.state.grid[row]?.[col] === TileType.DIRT) {
          fire.active = false
        }
      }
    }
    this.state.fires = this.state.fires.filter(f => f.active)
  }

  private detectCollisions(): void {
    const playerBox = {
      x: this.player.state.pos.x,
      y: this.player.state.pos.y,
      w: TILE_SIZE,
      h: TILE_SIZE,
    }

    // 1. Pump vs enemies
    const pumpHitbox = this.player.getPumpHitbox()
    if (pumpHitbox) {
      let hitAny = false
      for (const enemy of this.enemies) {
        if (enemy.entity.state === EnemyState.DEAD) continue
        const eb = {
          x: enemy.entity.pos.x, y: enemy.entity.pos.y,
          w: TILE_SIZE, h: TILE_SIZE,
        }
        if (this.boxCollide(pumpHitbox, eb)) {
          hitAny = true
          enemy.startInflating()
          if (enemy.entity.inflateCount >= PUMP_HOLD_FRAMES) {
            enemy.kill()
            const depthMultiplier = this.getDepthMultiplier(enemy.getGridRow())
            this.state.score += SCORE_PUMP_KILL * depthMultiplier
          }
        }
      }
      if (!hitAny) {
        for (const enemy of this.enemies) {
          if (enemy.entity.state === EnemyState.INFLATING) {
            enemy.releaseInflation()
          }
        }
      }
    } else {
      for (const enemy of this.enemies) {
        if (enemy.entity.state === EnemyState.INFLATING) {
          enemy.releaseInflation()
        }
      }
    }

    // 2. Rocks vs enemies
    for (const rock of this.rocks) {
      if (!rock.state.falling) continue
      const rockPos = rock.getPixelPos()
      const rockBox = { x: rockPos.x, y: rockPos.y, w: TILE_SIZE, h: TILE_SIZE }
      let crushCount = 0
      for (const enemy of this.enemies) {
        if (enemy.entity.state === EnemyState.DEAD) continue
        const eb = {
          x: enemy.entity.pos.x, y: enemy.entity.pos.y,
          w: TILE_SIZE, h: TILE_SIZE,
        }
        if (this.boxCollide(rockBox, eb)) {
          enemy.kill()
          crushCount++
        }
      }
      if (crushCount > 0) {
        const depthMultiplier = this.getDepthMultiplier(rock.state.row)
        this.state.score += SCORE_ROCK_KILL * depthMultiplier
        if (crushCount > 1) {
          this.state.score += SCORE_ROCK_BONUS * (crushCount - 1)
        }
      }

      // 3. Rocks vs player
      if (this.player.state.alive && this.boxCollide(rockBox, playerBox)) {
        this.killPlayer()
      }
    }

    // 4. Enemies vs player (contact)
    if (this.player.state.alive) {
      for (const enemy of this.enemies) {
        if (enemy.entity.state === EnemyState.DEAD ||
            enemy.entity.state === EnemyState.INFLATING) continue
        const eb = {
          x: enemy.entity.pos.x, y: enemy.entity.pos.y,
          w: TILE_SIZE, h: TILE_SIZE,
        }
        if (this.boxCollide(playerBox, eb)) {
          this.killPlayer()
          break
        }
      }
    }

    // 5. Fire vs player
    if (this.player.state.alive) {
      for (const fire of this.state.fires) {
        if (!fire.active) continue
        const fb = { x: fire.pos.x, y: fire.pos.y, w: 12, h: 10 }
        if (this.boxCollide(playerBox, fb)) {
          this.killPlayer()
          fire.active = false
          break
        }
      }
    }
  }

  private killPlayer(): void {
    this.player.state.alive = false
    this.state.lives--
    if (this.state.lives > 0) {
      this.playerRespawnTimer = 90
    }
  }

  private getDepthMultiplier(row: number): number {
    if (row <= 3) return SCORE_DEPTH_MULTIPLIER[0]
    if (row <= 5) return SCORE_DEPTH_MULTIPLIER[1]
    if (row <= 7) return SCORE_DEPTH_MULTIPLIER[2]
    return SCORE_DEPTH_MULTIPLIER[3]
  }

  private boxCollide(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
  ): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y
  }

  private emitState(): void {
    this.onStateChange({ ...this.state })
  }
}
