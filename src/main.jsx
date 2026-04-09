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

// Clear the pre-React loading timeout now that the framework has mounted
if (window.__debugClearLoadTimer) window.__debugClearLoadTimer()

// Mount debug pill in a separate React root so it survives App crashes.
// Available in production — alpha phase diagnostic tool.
mountDebugPill()
