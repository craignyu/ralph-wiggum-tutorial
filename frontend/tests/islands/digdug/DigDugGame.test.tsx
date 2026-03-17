import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DigDugGame } from '@/islands/digdug/DigDugGame'

// Mock canvas
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    roundRect: vi.fn(),
    setLineDash: vi.fn(),
    strokeRect: vi.fn(),
    canvas: { width: 560, height: 480 },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D)

  // Mock requestAnimationFrame
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {
    return 1
  })

  // Mock fetch for saves API
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
  }) as unknown as typeof fetch
})

describe('DigDugGame', () => {
  it('renders canvas element', () => {
    render(<DigDugGame />)
    const canvas = screen.getByLabelText('Dig Dug game')
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('width', '560')
    expect(canvas).toHaveAttribute('height', '480')
  })

  it('renders HUD with initial score 0', () => {
    render(<DigDugGame />)
    expect(screen.getByText(/How to Play/i)).toBeInTheDocument()
  })

  it('renders how to play section', () => {
    render(<DigDugGame />)
    expect(screen.getByText(/Arrow keys or WASD/i)).toBeInTheDocument()
    expect(screen.getByText(/Space or Z/i)).toBeInTheDocument()
  })
})
