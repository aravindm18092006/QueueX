import { useState, useEffect } from 'react'

const COLOR = { green: '#16a34a', orange: '#d97706', red: '#dc2626' }
const BG = {
  green: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
  orange: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
  red: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
}
const EMOJI = { green: '🟢', orange: '🟡', red: '🔴' }

export default function History() {
  const [history, setHistory] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem('predictionHistory') || '[]'))
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('predictionHistory')
    setHistory([])
  }

  const filtered = filter === 'All' ? history : history.filter(h => h.category === filter)

  const stats = {
    total: history.length,
    short: history.filter(h => h.color === 'green').length,
    moderate: history.filter(h => h.color === 'orange').length,
    long: history.filter(h => h.color === 'red').length,
    avg: history.length
      ? (history.reduce((s, h) => s + h.wait_time, 0) / history.length).toFixed(1)
      : '—',
  }

  return (
    <div className="glass-card" style={{ maxWidth: 720, width: '100%' }}>
      <div className="card-header-fancy">
        <div className="header-icon-wrap">📋</div>
        <div>
          <h2>Prediction History</h2>
          <p>{history.length} prediction{history.length !== 1 ? 's' : ''} recorded locally</p>
        </div>
        {history.length > 0 && (
          <button className="danger-btn" onClick={clearHistory}>🗑️ Clear All</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No predictions yet</h3>
          <p>Go to the Predict tab and make your first prediction!</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="history-stats">
            <div className="hstat-box">
              <div className="hstat-val" style={{ color: '#6366f1' }}>{stats.total}</div>
              <div className="hstat-lbl">Total</div>
            </div>
            <div className="hstat-box">
              <div className="hstat-val" style={{ color: '#16a34a' }}>{stats.short}</div>
              <div className="hstat-lbl">🟢 Short</div>
            </div>
            <div className="hstat-box">
              <div className="hstat-val" style={{ color: '#d97706' }}>{stats.moderate}</div>
              <div className="hstat-lbl">🟡 Moderate</div>
            </div>
            <div className="hstat-box">
              <div className="hstat-val" style={{ color: '#dc2626' }}>{stats.long}</div>
              <div className="hstat-lbl">🔴 Long</div>
            </div>
            <div className="hstat-box">
              <div className="hstat-val" style={{ color: '#0ea5e9' }}>{stats.avg}</div>
              <div className="hstat-lbl">⏱ Avg min</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-tabs">
            {['All', 'Short Wait', 'Moderate Wait', 'Long Wait'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'filter-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon" style={{ fontSize: 40 }}>🔍</div>
              <p>No predictions match this filter.</p>
            </div>
          ) : (
            <div className="history-list">
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  className="history-item"
                  style={{
                    background: BG[item.color],
                    borderLeftColor: COLOR[item.color],
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <div className="history-left">
                    <div className="history-wait" style={{ color: COLOR[item.color] }}>
                      {EMOJI[item.color]} {item.wait_time} min
                    </div>
                    <div className="history-cat" style={{ color: COLOR[item.color] }}>{item.category}</div>
                  </div>
                  <div className="history-right">
                    <div className="history-tag">📅 {item.date}</div>
                    <div className="history-tag">🕐 {item.time}</div>
                    <div className="history-tag">🏨 {item.department}</div>
                    <div className="history-tag">🚨 {item.urgency_level}</div>
                    <div className="history-tag">👤 {item.gender}, {item.age}y</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
