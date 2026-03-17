import { useState, useCallback } from 'react'
import type { GameSave, GameSaveCreate } from '@/types'

export function useGameSaves() {
  const [saves, setSaves] = useState<GameSave[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSaves = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/game/saves')
      if (res.ok) {
        setSaves(await res.json())
      }
    } catch (e) {
      console.error('Failed to fetch saves:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveTo = useCallback(async (data: GameSaveCreate) => {
    try {
      const res = await fetch('/api/game/saves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        await fetchSaves()
      }
    } catch (e) {
      console.error('Failed to save:', e)
    }
  }, [fetchSaves])

  const loadFrom = useCallback((slotNumber: number): GameSave | undefined => {
    return saves.find(s => s.slot_number === slotNumber)
  }, [saves])

  const deleteSave = useCallback(async (slotNumber: number) => {
    try {
      const res = await fetch(`/api/game/saves/${slotNumber}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchSaves()
      }
    } catch (e) {
      console.error('Failed to delete save:', e)
    }
  }, [fetchSaves])

  return { saves, loading, fetchSaves, saveTo, loadFrom, deleteSave }
}
