import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SettingsProvider } from './context/SettingsContext'
import { LibraryProvider } from './context/LibraryContext'
import { PlayerProvider } from './context/PlayerContext'
import { ToastProvider } from './components/Toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <LibraryProvider>
        <PlayerProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </PlayerProvider>
      </LibraryProvider>
    </SettingsProvider>
  </StrictMode>,
)
