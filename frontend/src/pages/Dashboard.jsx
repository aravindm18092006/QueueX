import { useState, useEffect } from 'react'

const MODEL_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b']

export default function Dashboard() {
  const [metrics, setMetrics] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/metrics').then(r => r.json()),
      fetch('http://localhost:8000/stats').then(r => r.json()),
    ])
      .then(([m, s]) => {
        setMetrics(m)
        setStats(s)
        setTimeout(() => setAnimated(true), 120)
      })
      .catch(() => setError('Could not load data. Make sure the API is running.'))
  }, [])

  const best = metrics.length ? metrics.reduce((a, b) => (a.MAE < b.MAE ? a : b)) : null
  const maxMAE = metrics.length ? Math.max(...metrics.map(m => m.MAE)) : 1

  return (
    <div className="dashboard-wrap">
      <div className="glass-card" style={{ maxWidth: 820, width: '100%' }}>
        <div className="card-header-fancy">
          <div className="header-icon-wrap">📊</div>
          <div>
            <h2>Model Performance Dashboard</h2>
            <p>Evaluation results from the last training run</p>
          </div>
        </div>

        {error && <div className="alert-error"><span>⚠️</span> {error}</div>}

        {/* Live prediction stats */}
        {stats && (
          <div className="live-stats-bar">
            <div className="live-stat">
              <div className="live-stat-val" style={{ color: '#6366f1' }}>{stats.total}</div>
              <div className="live-stat-lbl">Total Predictions</div>
            </div>
            <div className="live-stat">
              <div className="live-stat-val" style={{ color: '#0ea5e9' }}>{stats.avg_wait}</div>
              <div className="live-stat-lbl">Avg Wait (min)</div>
            </div>
            <div className="live-stat">
              <div className="live-stat-val" style={{ color: '#16a34a' }}>{stats.short}</div>
              <div className="live-stat-lbl">🟢 Short Waits</div>
            </div>
            <div className="live-stat">
              <div className="live-stat-val" style={{ color: '#dc2626' }}>{stats.long}</div>
              <div className="live-stat-lbl">🔴 Long Waits</div>
            </div>
          </div>
        )}

        {/* Best model banner */}
        {best && (
          <div className="best-banner">
            <div className="best-trophy">🏆</div>
            <div>
              <div className="best-title">Best Model: {best.Model}</div>
              <div className="best-sub">MAE: {best.MAE} &nbsp;|&nbsp; RMSE: {best.RMSE} &nbsp;|&nbsp; R²: {best.R2}</div>
            </div>
          </div>
        )}

        {/* Metric cards */}
        {metrics.length > 0 && (
          <>
            <div className="metric-cards">
              {metrics.map((m, i) => (
                <div
                  key={m.Model}
                  className={`metric-card ${m.Model === best?.Model ? 'metric-best' : ''}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="metric-model-name">
                    {m.Model === best?.Model && <span className="crown">👑</span>}
                    {m.Model}
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">MAE</span>
                    <div className="metric-bar-wrap">
                      <div className="metric-bar-track">
                        <div
                          className="metric-bar-fill"
                          style={{
                            width: animated ? `${(m.MAE / maxMAE) * 100}%` : '0%',
                            background: MODEL_COLORS[i],
                          }}
                        />
                      </div>
                      <span className="metric-val">{m.MAE}</span>
                    </div>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">RMSE</span>
                    <div className="metric-bar-wrap">
                      <div className="metric-bar-track">
                        <div
                          className="metric-bar-fill"
                          style={{
                            width: animated ? `${(m.RMSE / maxMAE) * 100}%` : '0%',
                            background: MODEL_COLORS[i] + 'aa',
                          }}
                        />
                      </div>
                      <span className="metric-val">{m.RMSE}</span>
                    </div>
                  </div>
                  <div className="metric-r2">
                    R² Score: <strong style={{ color: m.R2 > 0 ? '#16a34a' : '#dc2626' }}>{m.R2}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="metrics-table-wrap">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>MAE ↓</th>
                    <th>RMSE ↓</th>
                    <th>R² ↑</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(m => (
                    <tr key={m.Model} className={m.Model === best?.Model ? 'best-row' : ''}>
                      <td><strong>{m.Model}</strong></td>
                      <td>{m.MAE}</td>
                      <td>{m.RMSE}</td>
                      <td style={{ color: m.R2 > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{m.R2}</td>
                      <td>{m.Model === best?.Model ? <span className="badge-best">Best</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-box">
            <div className="chart-title">📊 Model Comparison</div>
            <img
              src="http://localhost:8000/charts/comparison"
              alt="Model Comparison"
              className="chart-img"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
          <div className="chart-box">
            <div className="chart-title">🔍 Feature Importances</div>
            <img
              src="http://localhost:8000/charts/importance"
              alt="Feature Importance"
              className="chart-img"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
