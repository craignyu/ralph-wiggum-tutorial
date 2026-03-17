interface GameHUDProps {
  score: number
  highScore: number
  level: number
  lives: number
}

export function GameHUD({ score, highScore, level, lives }: GameHUDProps) {
  return (
    <div className="flex justify-between items-center px-4 py-2 bg-gray-900 text-white font-mono text-sm rounded-t-lg" data-testid="game-hud">
      <span data-testid="score-display">SCORE: {score}</span>
      <span data-testid="level-display">LEVEL {level}</span>
      <span>HI: {highScore}</span>
      <span data-testid="lives-display">
        LIVES: {'♥'.repeat(Math.max(0, lives))}
      </span>
    </div>
  )
}
