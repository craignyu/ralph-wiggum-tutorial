import { useRef, useEffect, useState, useCallback } from 'react'
import { GameEngine } from './engine/GameEngine'
import { GameStatus, CANVAS_WIDTH, CANVAS_HEIGHT } from './engine/constants'
import type { GameState } from './engine/types'
import { useKeyboard } from './hooks/useKeyboard'
import { useGameSaves } from './hooks/useGameSaves'
import { GameHUD } from './components/GameHUD'
import { PauseOverlay } from './components/PauseOverlay'
import { SaveLoadModal } from './components/SaveLoadModal'
import type { GameSave } from '@/types'

export function DigDugGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const inputRef = useKeyboard()
  const { saves, fetchSaves } = useGameSaves()

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)

  // Track pause key state for edge detection
  const pausePressedRef = useRef(false)
  const restartPressedRef = useRef(false)

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state)
  }, [])

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GameEngine(canvasRef.current, handleStateChange)
    engine.setInputRef(inputRef)
    engineRef.current = engine

    // Fetch saves to determine initial high score
    fetchSaves().then(() => {
      engine.start()
    })

    return () => {
      engine.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set initial high score from saves
  useEffect(() => {
    if (saves.length > 0 && engineRef.current) {
      const maxHighScore = Math.max(0, ...saves.map(s => s.high_score))
      const state = engineRef.current.getState()
      if (maxHighScore > state.highScore) {
        // Engine will pick this up
      }
    }
  }, [saves])

  // Handle pause/restart key edge detection
  useEffect(() => {
    const interval = setInterval(() => {
      const engine = engineRef.current
      if (!engine || !inputRef.current) return
      const input = inputRef.current

      // Pause edge detection
      if (input.pause && !pausePressedRef.current) {
        pausePressedRef.current = true
        const state = engine.getState()
        if (state.status === GameStatus.PLAYING) {
          engine.pause()
        } else if (state.status === GameStatus.PAUSED) {
          setShowSaveModal(false)
          engine.resume()
        }
      }
      if (!input.pause) {
        pausePressedRef.current = false
      }

      // Restart edge detection
      if (input.restart && !restartPressedRef.current) {
        restartPressedRef.current = true
        engine.restart()
        setShowSaveModal(false)
      }
      if (!input.restart) {
        restartPressedRef.current = false
      }
    }, 16)

    return () => clearInterval(interval)
  }, [inputRef])

  const handleResume = () => {
    setShowSaveModal(false)
    engineRef.current?.resume()
  }

  const handleRestart = () => {
    setShowSaveModal(false)
    engineRef.current?.restart()
  }

  const handleSaveOpen = () => {
    setShowSaveModal(true)
  }

  const handleQuit = () => {
    window.location.href = '/'
  }

  const handleLoad = (save: GameSave) => {
    setShowSaveModal(false)
    engineRef.current?.loadSave({
      score: save.score,
      highScore: save.high_score,
      level: save.level,
      lives: save.lives,
    })
  }

  const status = gameState?.status ?? GameStatus.IDLE
  const isPaused = status === GameStatus.PAUSED
  const isGameOver = status === GameStatus.GAME_OVER
  const isWin = status === GameStatus.WIN

  return (
    <div className="flex flex-col items-center">
      {gameState && (
        <GameHUD
          score={gameState.score}
          highScore={gameState.highScore}
          level={gameState.level}
          lives={gameState.lives}
        />
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-label="Dig Dug game"
          className="block border-2 border-gray-700"
        />

        {isPaused && !showSaveModal && (
          <PauseOverlay
            onResume={handleResume}
            onRestart={handleRestart}
            onSave={handleSaveOpen}
            onQuit={handleQuit}
          />
        )}

        {showSaveModal && gameState && (
          <SaveLoadModal
            currentScore={gameState.score}
            currentHighScore={gameState.highScore}
            currentLevel={gameState.level}
            currentLives={gameState.lives}
            onClose={() => setShowSaveModal(false)}
            onLoad={handleLoad}
          />
        )}

        {(isGameOver || isWin) && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-10">
            <h2 className="text-4xl font-bold text-white mb-4 font-mono">
              {isGameOver ? 'GAME OVER' : 'YOU WIN!'}
            </h2>
            <p className="text-white mb-2 font-mono">Score: {gameState?.score}</p>
            <p className="text-gray-300 mb-6 font-mono">High Score: {gameState?.highScore}</p>
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-mono text-lg"
            >
              Play Again (R)
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 max-w-xl text-gray-400 text-sm font-mono px-4">
        <h3 className="text-lg text-white mb-2">How to Play</h3>
        <ul className="space-y-1">
          <li>🎮 <strong>Move:</strong> Arrow keys or WASD</li>
          <li>💨 <strong>Pump:</strong> Space or Z — inflate enemies until they pop!</li>
          <li>⏸️ <strong>Pause:</strong> P or Escape</li>
          <li>🔄 <strong>Restart:</strong> R</li>
          <li>🪨 Dig through dirt and drop rocks on enemies for bonus points!</li>
          <li>⚠️ Watch out for Fygar's fire breath!</li>
        </ul>
      </div>
    </div>
  )
}
