import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global Error Handling（残してOK）
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[Global Error]', { message, source, lineno, colno, error })
}
window.onunhandledrejection = (event) => {
  console.error('[Unhandled Rejection]', event.reason)
}

const el = document.getElementById('root')
if (!el) {
  console.error('No #root element found in index.html')
} else {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
