/**
 * HelloIsland component tests.
 * 
 * Tests the greeting island's core functionality:
 * - Rendering with initial data
 * - Displaying empty state
 * - Form interaction
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HelloIsland } from '@/islands/hello/HelloIsland'

describe('HelloIsland', () => {
  it('renders empty state when no data provided', () => {
    render(<HelloIsland />)
    expect(screen.getByText(/no greetings yet/i)).toBeInTheDocument()
  })

  it('renders initial data', () => {
    const initialData = [
      { id: 1, message: 'Hello World', created_at: '2024-01-01T00:00:00' },
    ]
    render(<HelloIsland initialData={initialData} />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders input field and add button', () => {
    render(<HelloIsland />)
    expect(screen.getByPlaceholderText(/enter a greeting/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('disables add button when input is empty', () => {
    render(<HelloIsland />)
    const button = screen.getByRole('button', { name: /add/i })
    expect(button).toBeDisabled()
  })
})
