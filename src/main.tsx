import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import config from './config/config'
import { applyThemeToDocument, resolveInitialTheme } from './config/themes'
import './index.css'
import App from './App.tsx'

applyThemeToDocument(resolveInitialTheme(config.app.theme))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
