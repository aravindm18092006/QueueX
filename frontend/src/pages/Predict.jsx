import { useState } from 'react'

const URGENCY_LEVELS = [
  { value: 'Emergency', icon: '🚨', color: '#dc2626' },
  { value: 'Urgent', icon: '⚠️', color: '#d97706' },
  { value: 'Semi-Urgent', icon: '🔵', color: '#2563eb' },
  { value: 'Non-Urgent', icon: '🟢', color: '#16a34a' },
]

const DEPARTMENTS = [
  'No Referral', 'General Practice', 'Orthopedics',
  'Physiotherapy', 'Renal', 'Gastroenterology', 'Cardiology', 'Neurology',
]

const defaultForm = {
  admission_date: '',
  admission_time: '',
  gender: 'Female',
  age: 35,
  urgency_level: 'Non-Urgent',
  department: 'No Referral',
  admission_flag: 'Not Admission',
}

const COLOR = { green: '#16a34a', orange: '#d97706', red: '#dc2626' }
const GRADIENT = {
  green: 'linear-gradient(135deg, #bbf7d0, #86efac)',
  orange: 'linear-gradient(135deg, #fde68a, #fcd34d)',
  red: 'linear-gradient(135deg, #fecaca, #fca5a5)',
}
const EMOJI = { green: '🟢', orange: '🟡', red: '🔴' }

function saveToHistory(form, data) {
  const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]')
  history.unshift({
    id: Date.now(),
    date: form.admission_date,
    time: form.admission_time,
    department: form.department,
    gender: form.gender,
    age: form.age,
    urgency_level: form.urgency_level,
    wait_time: data.wait_time,
    category: data.category,
    color: data.color,
  })
  localStorage.setItem('predictionHistory', JSON.stringify(history.slice(0, 50)))
}

export default function Predict() {
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actualWait, setActualWait] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setShowResult(false)
    setFeedbackSent(false)
    setActualWait('')

    if (!form.admission_date || !form.admission_time) {
      setError('Please fill in Admission Date and Time.')
      return
    }

    setLoading(true)
    try {
      const [year, month, day] = form.admission_date.split('-')
      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          admission_date: `${day}/${month}/${year}`,
          admission_time: `${form.admission_time}:00`,
          age: parseInt(form.age),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Prediction failed. Is the API running?')
      }
      const data = await res.json()
      setResult(data)
      saveToHistory(form, data)
      setTimeout(() => setShowResult(true), 60)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async () => {
    if (!actualWait || isNaN(actualWait)) return
    try {
      await fetch('http://localhost:8000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predicted_wait_time: result.wait_time,
          actual_wait_time: parseFloat(actualWait),
          department: form.department,
        }),
      })
      setFeedbackSent(true)
    } catch {
      setFeedbackSent(true)
    }
  }

  const urgency = URGENCY_LEVELS.find(u => u.value === form.urgency_level)

  return (
    <div className="predict-layout">
      {/* ── Form Card ── */}
      <div className="glass-card">
        <div className="card-header-fancy">
          <div className="header-icon-wrap">🏥</div>
          <div>
            <h2>Patient Details</h2>
            <p>Enter admission information to predict wait time</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Admission Info */}
          <div className="form-section">
            <div className="section-label">📅 Admission Info</div>
            <div className="grid-2">
              <div className="field">
                <label>Admission Date</label>
                <input type="date" name="admission_date" value={form.admission_date} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Admission Time</label>
                <input type="time" name="admission_time" value={form.admission_time} onChange={handleChange} required />
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="form-section">
            <div className="section-label">👤 Patient Info</div>
            <div className="grid-2">
              <div className="field">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>
              <div className="field">
                <label>Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} min={1} max={120} required />
              </div>
            </div>
          </div>

          {/* Clinical Info */}
          <div className="form-section">
            <div className="section-label">🏨 Clinical Info</div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Urgency Level</label>
              <div className="urgency-grid">
                {URGENCY_LEVELS.map(u => (
                  <button
                    key={u.value}
                    type="button"
                    className={`urgency-btn ${form.urgency_level === u.value ? 'urgency-active' : ''}`}
                    style={form.urgency_level === u.value
                      ? { borderColor: u.color, background: u.color + '18', color: u.color }
                      : {}}
                    onClick={() => setForm({ ...form, urgency_level: u.value })}
                  >
                    <span>{u.icon}</span>
                    <span>{u.value}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Department Referral</label>
                <select name="department" value={form.department} onChange={handleChange}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Admission Type</label>
                <select name="admission_flag" value={form.admission_flag} onChange={handleChange}>
                  <option>Not Admission</option>
                  <option>Admission</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" className="predict-btn" disabled={loading}>
            {loading
              ? <span className="btn-loading"><span className="spin-ring" /><span>Analyzing patient data...</span></span>
              : <span>🔍 Predict Wait Time</span>
            }
          </button>
        </form>
      </div>

      {/* ── Result Card ── */}
      {result && (
        <div className={`glass-card ${showResult ? 'result-visible' : 'result-hidden'}`}>
          {/* Hero */}
          <div className="result-hero" style={{ background: GRADIENT[result.color] }}>
            <span className="result-emoji">{EMOJI[result.color]}</span>
            <div className="result-minutes" style={{ color: COLOR[result.color] }}>
              {result.wait_time}
            </div>
            <div className="result-unit">minutes estimated wait</div>
            <span className="result-badge" style={{ background: COLOR[result.color] }}>
              {result.category}
            </span>
          </div>

          {/* Gauge */}
          <div className="gauge-section">
            <div className="gauge-track">
              <div
                className="gauge-fill"
                style={{
                  width: showResult ? `${Math.min((result.wait_time / 60) * 100, 100)}%` : '0%',
                  background: `linear-gradient(90deg, ${COLOR[result.color]}66, ${COLOR[result.color]})`,
                }}
              />
            </div>
            <div className="gauge-labels">
              <span>0 min</span>
              <span style={{ color: COLOR[result.color], fontWeight: 700 }}>{result.wait_time} min</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-icon">🏨</div>
              <div className="stat-val">{form.department}</div>
              <div className="stat-lbl">Department</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">{urgency?.icon}</div>
              <div className="stat-val">{form.urgency_level}</div>
              <div className="stat-lbl">Urgency</div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🕐</div>
              <div className="stat-val">{form.admission_time}</div>
              <div className="stat-lbl">Admission Time</div>
            </div>
          </div>

          {/* Feedback */}
          <div className="feedback-section">
            {!feedbackSent ? (
              <>
                <p className="feedback-title">📝 How accurate was this prediction? (optional)</p>
                <div className="feedback-row">
                  <input
                    type="number"
                    placeholder="Enter actual wait time (min)"
                    value={actualWait}
                    onChange={e => setActualWait(e.target.value)}
                    min={1} max={300}
                  />
                  <button className="feedback-btn" onClick={handleFeedback}>Submit</button>
                </div>
              </>
            ) : (
              <div className="feedback-success">✅ Thank you for your feedback!</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
