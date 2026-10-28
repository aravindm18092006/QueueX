import { useState } from 'react'
import Predict from './pages/Predict'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import './App.css'

const TABS = [
  { label: 'Predict', icon: '🔍' },
  { label: 'History', icon: '📋' },
  { label: 'Dashboard', icon: '📊' },
]

export default function App() {
  const [tab, setTab] = useState(0)

  return (
    <div className="app">
      <div className="bg-blob blob1" />
      <div className="bg-blob blob2" />
      <div className="bg-blob blob3" />

      <header className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon-wrap">🏥</div>
          <div>
            <div className="brand-title">Hospital Queue Predictor</div>
            <div className="brand-sub">AI-Powered Wait Time Estimation</div>
          </div>
        </div>
        <nav className="navbar-tabs">
          {TABS.map((t, i) => (
            <button
              key={i}
              className={`tab-btn ${tab === i ? 'active' : ''}`}
              onClick={() => setTab(i)}
            >
              <span className="tab-icon">{t.icon}</span>
              <span>{t.label}</span>
              {tab === i && <span className="tab-indicator" />}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        <div className="page-wrapper">
          {tab === 0 && <Predict />}
          {tab === 1 && <History />}
          {tab === 2 && <Dashboard />}
        </div>
      </main>

      <footer className="footer">
        <span>⚕️ Wait categories are illustrative and not validated clinical standards.</span>
        <span className="footer-dot">•</span>
        <span>Built with FastAPI + React + scikit-learn</span>
      </footer>
    </div>
  )
}
