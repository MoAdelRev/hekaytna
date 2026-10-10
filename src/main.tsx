import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import '@fontsource/cairo/arabic-400.css'
import '@fontsource/cairo/arabic-600.css'
import '@fontsource/cairo/arabic-700.css'
import '@fontsource/amiri/arabic-400.css'
import '@fontsource/amiri/arabic-700.css'
import { App } from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user" transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
      <HashRouter>
        <App />
      </HashRouter>
    </MotionConfig>
  </React.StrictMode>,
)
