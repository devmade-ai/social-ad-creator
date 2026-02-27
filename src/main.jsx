import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { mountDebugPill } from './components/DebugPill.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Mount debug pill in a separate React root so it survives App crashes.
// Only in development to avoid exposing diagnostics to end users.
if (import.meta.env.DEV) {
  mountDebugPill()
}
