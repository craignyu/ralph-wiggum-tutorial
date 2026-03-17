import { useEffect, useRef } from 'react'
import type { InputState } from '../engine/types'

/**
 * Keyboard input hook for Dig Dug game.
 * Returns a ref to InputState that updates in real-time without re-renders.
 */
export function useKeyboard(): { current: InputState } {
  const inputRef = useRef<InputState>({
    up: false, down: false, left: false, right: false,
    pump: false, pause: false, restart: false,
  })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const state = inputRef.current
      let handled = true

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          state.up = true; break
        case 'ArrowDown': case 's': case 'S':
          state.down = true; break
        case 'ArrowLeft': case 'a': case 'A':
          state.left = true; break
        case 'ArrowRight': case 'd': case 'D':
          state.right = true; break
        case ' ': case 'z': case 'Z':
          state.pump = true; break
        case 'p': case 'P': case 'Escape':
          state.pause = true; break
        case 'r': case 'R':
          state.restart = true; break
        default:
          handled = false
      }

      if (handled) e.preventDefault()
    }

    function handleKeyUp(e: KeyboardEvent) {
      const state = inputRef.current

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          state.up = false; break
        case 'ArrowDown': case 's': case 'S':
          state.down = false; break
        case 'ArrowLeft': case 'a': case 'A':
          state.left = false; break
        case 'ArrowRight': case 'd': case 'D':
          state.right = false; break
        case ' ': case 'z': case 'Z':
          state.pump = false; break
        case 'p': case 'P': case 'Escape':
          state.pause = false; break
        case 'r': case 'R':
          state.restart = false; break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return inputRef
}
