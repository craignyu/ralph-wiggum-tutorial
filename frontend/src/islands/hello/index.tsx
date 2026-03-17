/**
 * Hello Island mount logic.
 * 
 * This module is dynamically imported by main.ts when a
 * [data-island="hello"] element is found in the DOM.
 * 
 * The mount function receives the DOM element and parsed props,
 * then renders the React component into that element.
 */
import { createRoot } from 'react-dom/client'
import { HelloIsland } from './HelloIsland'
import type { Hello } from '@/types'

/**
 * Mount the HelloIsland component into the given element.
 * 
 * @param element - DOM element to render into
 * @param props - Initial data from server (Hello[])
 */
export function mount(element: HTMLElement, props: unknown): void {
  // Clear loading placeholder
  element.innerHTML = ''
  
  // Parse props - expect an array of Hello objects
  const initialData = Array.isArray(props) ? props as Hello[] : []
  
  // Create React root and render
  const root = createRoot(element)
  root.render(<HelloIsland initialData={initialData} />)
}
