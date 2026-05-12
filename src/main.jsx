/**
 * main.jsx — Application entry point
 * Mounts React root for state management + UI chrome.
 * PixiJS canvas is managed separately via engine/PixiApp.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
