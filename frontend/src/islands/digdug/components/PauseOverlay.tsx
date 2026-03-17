interface PauseOverlayProps {
  onResume: () => void
  onRestart: () => void
  onSave: () => void
  onQuit: () => void
}

export function PauseOverlay({ onResume, onRestart, onSave, onQuit }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-10" data-testid="pause-overlay">
      <h2 className="text-4xl font-bold text-white mb-8 font-mono">PAUSED</h2>
      <div className="flex flex-col gap-3">
        <button
          onClick={onResume}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-mono text-lg"
        >
          Resume (P)
        </button>
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-mono text-lg"
        >
          Restart (R)
        </button>
        <button
          onClick={onSave}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-mono text-lg"
        >
          Save Game
        </button>
        <button
          onClick={onQuit}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-mono text-lg"
        >
          Quit
        </button>
      </div>
    </div>
  )
}
