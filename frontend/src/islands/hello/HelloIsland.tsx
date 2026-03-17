/**
 * HelloIsland - Interactive greeting component
 * 
 * Demonstrates the islands pattern by:
 * - Receiving initial data from server via data-props
 * - Fetching fresh data from API
 * - Allowing users to add new greetings
 * 
 * This island handles its own data fetching and state management,
 * making it self-contained and portable.
 */
import React, { useState, useEffect } from 'react'
import type { Hello, HelloCreate } from '@/types'

interface HelloIslandProps {
  initialData?: Hello[]
}

export function HelloIsland({ initialData = [] }: HelloIslandProps) {
  const [hellos, setHellos] = useState<Hello[]>(initialData)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch fresh data from API on mount
  useEffect(() => {
    fetchHellos()
  }, [])

  async function fetchHellos() {
    try {
      const response = await fetch('/api/hello')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setHellos(data)
    } catch (e) {
      console.error('Failed to fetch hellos:', e)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    setError(null)

    try {
      const payload: HelloCreate = { message: message.trim() }
      const response = await fetch('/api/hello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create')
      }

      const newHello = await response.json()
      setHellos([newHello, ...hellos])
      setMessage('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/hello/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      setHellos(hellos.filter(h => h.id !== id))
    } catch (e) {
      console.error('Failed to delete:', e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new greeting form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a greeting..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          maxLength={255}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Greetings list */}
      <div className="space-y-2">
        {hellos.length === 0 ? (
          <p className="text-gray-500 italic">No greetings yet. Add one above!</p>
        ) : (
          hellos.map((hello) => (
            <div
              key={hello.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <span className="text-gray-800">{hello.message}</span>
                <span className="text-gray-400 text-sm ml-2">
                  {new Date(hello.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => handleDelete(hello.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
