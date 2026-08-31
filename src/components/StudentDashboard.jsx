import { useState, useEffect } from 'react'
import { getExerciseAttempts, getExerciseResults } from '../services/progressService'

const LEVEL_THRESHOLDS = [
  { min: 0,   max: 20,  label: 'Débutant',      icon: '🌱', color: '#6b7280', bg: 'rgba(107,114,128,.1)' },
  { min: 20,  max: 40,  label: 'Initié',         icon: '📘', color: '#3b82f6', bg: 'rgba(59,130,246,.1)' },
  { min: 40,  max: 60,  label: 'Intermédiaire',  icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
  { min: 60,  max: 80,  label: 'Avancé',         icon: '🔥', color: '#f97316', bg: 'rgba(249,115,22,.1)' },
  { min: 80,  max: 95,  label: 'Expert',         icon: '🏆', color: '#10b981', bg: 'rgba(16,185,129,.1)' },
  { min: 95,  max: 101, label: 'Maître',         icon: '💎', color: '#8b5cf6', bg: 'rgba(139,92,246,.1)' },
]

function getLevel(pct) {
  return LEVEL_THRESHOLDS.find(l => pct >= l.min && pct < l.max) || LEVEL_THRESHOLDS[0]
}

function normalize(s) {
  return String(s).toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3.6e6)
  if (h < 24) return h === 0 ? "il y a moins d'1h" : `il y a ${h}h`
  const d = Math.floor(diff / 86400000)
  return `il y a ${d} jour${d > 1 ? 's' : ''}`
}

function MiniBar({ pct, color }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--sf-border)' }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function StatCard({ icon, value, label, sub, color }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', boxShadow: 'var(--sf-shadow-xs)' }}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-extrabold text-[28px] leading-none" style={{ color: color || 'var(--sf-primary)', fontFamily: 'var(--sf-font-heading)' }}>{value}</div>
      <div className="text-[12px] font-semibold" style={{ color: 'var(--sf-text)' }}>{label}</div>
      {sub && <div className="text-[11px]" style={{ color: 'var(--sf-muted)' }}>{sub}</div>}
    </div>
  )
}

function ActivityChart({ attempts }) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const dayAttempts = attempts.filter(a => a.attempted_at?.slice(0, 10) === key)
    days.push({
      key,
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3),
      count: dayAttempts.length,
      correct: dayAttempts.filter(a => a.is_correct).length,
    })
  }
  const maxCount = Math.max(...days.map(d => d.count), 1)

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', boxShadow: 'var(--sf-shadow-xs)' }}>
      <h3 className="text-[13px] font-bold mb-4" style={{ color: 'var(--sf-text)' }}>Activité — 7 derniers jours</h3>
      <div className="flex items-end gap-2 h-20">
        {days.map(d => (
          <div key={d.key} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-md relative overflow-hidden" style={{ height: d.count === 0 ? 4 : Math.max(8, (d.count / maxCount) * 72), background: 'var(--sf-border)' }}>
              {d.count > 0 && (
                <div className="absolute bottom-0 left-0 right-0 rounded-t-md"
                  style={{ height: `${Math.round((d.correct / d.count) * 100)}%`, background: 'var(--sf-primary)', minHeight: 4 }} />
              )}
            </div>
            <div className="text-[9px] font-semibold uppercase" style={{ color: 'var(--sf-muted)' }}>{d.label}</div>
            {d.count > 0 && <div className="text-[9px] font-bold" style={{ color: 'var(--sf-text)' }}>{d.count}</div>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--sf-primary)' }} />
          <span className="text-[10px]" style={{ color: 'var(--sf-muted)' }}>Correctes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--sf-border)' }} />
          <span className="text-[10px]" style={{ color: 'var(--sf-muted)' }}>Tentatives totales</span>
        </div>
      </div>
    </div>
  )
}

export default function StudentDashboard({ user }) {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    getExerciseAttempts(user.id).then(data => { setAttempts(data); setLoading(false) })
  }, [user?.id])

  if (!user) return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">🔐</div>
      <p className="font-semibold text-[15px] mb-1" style={{ color: 'var(--sf-text)' }}>Connectez-vous pour accéder à votre dashboard</p>
      <p className="text-[13px]" style={{ color: 'var(--sf-muted)' }}>Votre progression sera enregistrée après chaque exercice.</p>
    </div>
  )

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {[1,2,3,4].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
    </div>
  )

  if (attempts.length === 0) return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">🎯</div>
      <p className="font-bold text-[17px] mb-2" style={{ color: 'var(--sf-text)' }}>Votre aventure commence ici !</p>
      <p className="text-[13px] max-w-sm mx-auto" style={{ color: 'var(--sf-muted)' }}>
        Faites votre premier exercice dans l'onglet <strong>Exercices</strong> pour voir votre progression apparaître ici.
      </p>
    </div>
  )

  /* ── Compute stats ── */
  const total   = attempts.length
  const correct = attempts.filter(a => a.is_correct).length
  const pct     = Math.round((correct / total) * 100)
  const level   = getLevel(pct)

  /* Streak */
  const sortedDates = [...new Set(attempts.map(a => a.attempted_at?.slice(0, 10)).filter(Boolean))].sort().reverse()
  let streak = 0
  const today = new Date().toISOString().slice(0, 10)
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = new Date()
    expected.setDate(expected.getDate() - i)
    if (sortedDates[i] === expected.toISOString().slice(0, 10)) streak++
    else break
  }

  /* Questions à revoir (ratées 2x+) */
  const failCounts = {}
  attempts.filter(a => !a.is_correct).forEach(a => {
    if (!a.question_id) return
    failCounts[a.question_id] = (failCounts[a.question_id] || 0) + 1
  })
  const toReview = Object.entries(failCounts)
    .filter(([, n]) => n >= 2)
    .map(([qid, n]) => {
      const a = attempts.find(x => x.question_id === qid)
      return { qid, n, question: a?.question || 'Question', lastAnswer: a?.user_answer }
    })
    .sort((a, b) => b.n - a.n)
    .slice(0, 5)

  /* By exercise */
  const byExercise = {}
  attempts.forEach(a => {
    if (!a.exercise_id) return
    if (!byExercise[a.exercise_id]) byExercise[a.exercise_id] = { correct: 0, total: 0, id: a.exercise_id }
    byExercise[a.exercise_id].total++
    if (a.is_correct) byExercise[a.exercise_id].correct++
  })
  const exerciseStats = Object.values(byExercise)
    .map(e => ({ ...e, pct: Math.round((e.correct / e.total) * 100) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  /* Dernières erreurs */
  const recentErrors = attempts.filter(a => !a.is_correct).slice(0, 6)

  return (
    <div className="max-w-[900px] mx-auto space-y-6">

      {/* Badge de niveau */}
      <div className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: `linear-gradient(135deg, var(--sf-primary), #163b6b)`, border: '1px solid rgba(201,168,76,.2)' }}>
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-[36px]"
          style={{ background: 'rgba(255,255,255,.1)' }}>
          {level.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(201,168,76,.7)' }}>
            Votre niveau
          </div>
          <div className="font-extrabold text-[22px] text-white" style={{ fontFamily: 'var(--sf-font-heading)' }}>
            {level.label}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.15)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#C9A84C' }} />
            </div>
            <span className="text-[13px] font-bold text-white flex-shrink-0">{pct}%</span>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-center gap-0.5 flex-shrink-0 text-center">
          <div className="text-[10px] font-semibold uppercase" style={{ color: 'rgba(255,255,255,.5)' }}>Streak</div>
          <div className="font-extrabold text-[28px] text-white leading-none">{streak}</div>
          <div className="text-[10px]" style={{ color: 'rgba(255,255,255,.4)' }}>jour{streak > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="✅" value={correct} label="Correctes" sub={`sur ${total} tentatives`} color="#10b981" />
        <StatCard icon="📊" value={`${pct}%`} label="Taux de réussite" sub="toutes questions" color="var(--sf-primary)" />
        <StatCard icon="🔥" value={streak} label={`Jour${streak !== 1 ? 's' : ''} consécutif${streak !== 1 ? 's' : ''}`} sub="activité quotidienne" color="#f97316" />
        <StatCard icon="🎯" value={toReview.length} label="À revoir" sub="ratées 2x ou plus" color={toReview.length > 0 ? '#ef4444' : '#10b981'} />
      </div>

      {/* Activité chart */}
      <ActivityChart attempts={attempts} />

      {/* Taux de réussite par exercice */}
      {exerciseStats.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', boxShadow: 'var(--sf-shadow-xs)' }}>
          <h3 className="text-[13px] font-bold mb-4" style={{ color: 'var(--sf-text)' }}>Taux de réussite par exercice</h3>
          <div className="space-y-3">
            {exerciseStats.map((ex, i) => (
              <div key={ex.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--sf-text)' }}>
                    Exercice #{i + 1} <span className="text-[11px]" style={{ color: 'var(--sf-muted)' }}>· {ex.total} question{ex.total > 1 ? 's' : ''}</span>
                  </span>
                  <span className="text-[12px] font-bold" style={{ color: ex.pct >= 70 ? '#10b981' : ex.pct >= 40 ? '#f59e0b' : '#ef4444' }}>
                    {ex.pct}%
                  </span>
                </div>
                <MiniBar pct={ex.pct} color={ex.pct >= 70 ? '#10b981' : ex.pct >= 40 ? '#f59e0b' : '#ef4444'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions à revoir en priorité */}
      {toReview.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--sf-surface)', border: '1.5px solid rgba(239,68,68,.2)', boxShadow: 'var(--sf-shadow-xs)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[18px]">🔁</span>
            <h3 className="text-[13px] font-bold" style={{ color: 'var(--sf-text)' }}>Questions à revoir en priorité</h3>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{toReview.length} question{toReview.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2.5">
            {toReview.map(q => (
              <div key={q.qid} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)' }}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 bg-red-100 text-red-600">
                  ✗
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium leading-snug" style={{ color: 'var(--sf-text)' }}>{q.question}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--sf-muted)' }}>
                    Ratée <strong>{q.n} fois</strong>
                    {q.lastAnswer && <> · Dernière réponse : <em>"{q.lastAnswer}"</em></>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points forts / points faibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.2)' }}>
          <h3 className="text-[13px] font-bold mb-3 flex items-center gap-2">
            <span>💪</span> <span style={{ color: '#065f46' }}>Points forts</span>
          </h3>
          {exerciseStats.filter(e => e.pct >= 70).length > 0 ? (
            <div className="space-y-1.5">
              {exerciseStats.filter(e => e.pct >= 70).slice(0, 3).map((e, i) => (
                <div key={e.id} className="flex items-center justify-between text-[12px]" style={{ color: '#065f46' }}>
                  <span>Exercice #{exerciseStats.indexOf(e) + 1}</span>
                  <span className="font-bold">{e.pct}% ✓</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px]" style={{ color: '#065f46', opacity: 0.7 }}>Continuez à pratiquer !</p>
          )}
        </div>
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.15)' }}>
          <h3 className="text-[13px] font-bold mb-3 flex items-center gap-2">
            <span>📖</span> <span style={{ color: '#991b1b' }}>À améliorer</span>
          </h3>
          {exerciseStats.filter(e => e.pct < 60).length > 0 ? (
            <div className="space-y-1.5">
              {exerciseStats.filter(e => e.pct < 60).slice(0, 3).map((e, i) => (
                <div key={e.id} className="flex items-center justify-between text-[12px]" style={{ color: '#991b1b' }}>
                  <span>Exercice #{exerciseStats.indexOf(e) + 1}</span>
                  <span className="font-bold">{e.pct}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px]" style={{ color: '#991b1b', opacity: 0.7 }}>Aucun point faible détecté ! 🎉</p>
          )}
        </div>
      </div>

      {/* Historique récent */}
      {recentErrors.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', boxShadow: 'var(--sf-shadow-xs)' }}>
          <h3 className="text-[13px] font-bold mb-4" style={{ color: 'var(--sf-text)' }}>Dernières erreurs</h3>
          <div className="space-y-2">
            {recentErrors.map((a, i) => (
              <div key={a.id || i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--sf-border)' }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 bg-red-100 text-red-600">✗</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium leading-snug" style={{ color: 'var(--sf-text)' }}>
                    {a.question || `Exercice ${a.exercise_id?.slice(0, 8) || '?'}`}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--sf-muted)' }}>
                    Votre réponse : <em>"{a.user_answer}"</em>
                    {a.attempted_at && <span> · {formatRelative(a.attempted_at)}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
