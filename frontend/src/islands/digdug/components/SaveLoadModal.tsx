import { useEffect } from 'react'
import type { GameSave, GameSaveCreate } from '@/types'
import { useGameSaves } from '../hooks/useGameSaves'

interface SaveLoadModalProps {
  currentScore: number
  currentHighScore: number
  currentLevel: number
  currentLives: number
  onClose: () => void
  onLoad: (save: GameSave) => void
}

export function SaveLoadModal({
  currentScore, currentHighScore, currentLevel, currentLives,
  onClose, onLoad,
}: SaveLoadModalProps) {
  const { saves, loading, fetchSaves, saveTo, deleteSave } = useGameSaves()

  useEffect(() => {
    fetchSaves()
  }, [fetchSaves])

  const handleSave = async (slotNumber: number) => {
    const data: GameSaveCreate = {
      slot_number: slotNumber,
      slot_name: `Slot ${slotNumber}`,
      score: currentScore,
      high_score: currentHighScore,
      level: currentLevel,
      lives: currentLives,
    }
    await saveTo(data)
  }

  const handleLoad = (slotNumber: number) => {
    const save = saves.find(s => s.slot_number === slotNumber)
    if (save) onLoad(save)
  }

  const handleDelete = async (slotNumber: number) => {
    await deleteSave(slotNumber)
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-85 flex flex-col items-center justify-center z-20" data-testid="save-modal">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4 font-mono text-center">Save / Load</h2>
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          <div className="space-y-3">
            {[1, 2, 3].map(slot => {
              const save = saves.find(s => s.slot_number === slot)
              return (
                <div key={slot} className="bg-gray-700 rounded-lg p-4" data-testid={`save-slot-${slot}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-mono font-bold">Slot {slot}</span>
                    {save && (
                      <span className="text-gray-400 text-xs">
                        {new Date(save.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {save ? (
                    <div className="text-gray-300 text-sm mb-2 font-mono">
                      Level {save.level} • Score {save.score} • Lives {save.lives}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm mb-2 italic">Empty</div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(slot)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Save Here
                    </button>
                    <button
                      onClick={() => handleLoad(slot)}
                      disabled={!save}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load
                    </button>
                    {save && (
                      <button
                        onClick={() => handleDelete(slot)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-mono"
        >
          Close
        </button>
      </div>
    </div>
  )
}
