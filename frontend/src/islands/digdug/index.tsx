import { createRoot } from 'react-dom/client'
import { DigDugGame } from './DigDugGame'

export function mount(element: HTMLElement, _props: unknown): void {
  element.innerHTML = ''
  const root = createRoot(element)
  root.render(<DigDugGame />)
}
