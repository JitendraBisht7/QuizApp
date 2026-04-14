import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode removed — it double-invokes effects in dev causing duplicate DB saves
createRoot(document.getElementById('root')).render(<App />)
