import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#101a2c',
          color: '#dce8f5',
          border: '1px solid #1a2d42',
          fontFamily: '"Rajdhani", sans-serif',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#06090f' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#06090f' } },
      }}
    />
  </React.StrictMode>
)
