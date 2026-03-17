/**
 * Shared TypeScript types for the application.
 *
 * These types are used across islands, components, and API interactions.
 */

/**
 * Hello record from the API.
 */
export interface Hello {
  id: number
  message: string
  created_at: string
}

/**
 * Request payload for creating a new Hello.
 */
export interface HelloCreate {
  message: string
}

/**
 * Generic API error response.
 */
export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>[]
}

/**
 * Props passed to islands via data-props attribute.
 * Each island receives its initial data from the server.
 */
export type IslandProps<T = unknown> = {
  initialData?: T
}

/**
 * Game save record from the API.
 */
export interface GameSave {
  id: number
  slot_number: number
  slot_name: string
  score: number
  high_score: number
  level: number
  lives: number
  created_at: string
  updated_at: string
}

/**
 * Request payload for creating/updating a game save.
 */
export interface GameSaveCreate {
  slot_number: number
  slot_name: string
  score: number
  high_score: number
  level: number
  lives: number
}
