import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCaseStudy } from '../services/caseStudiesService'

/* ─── Fuzzy matching (same as exercises) ─────────────────────────── */
function normalize(s) {
  return String(s).toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
}
function levenshtein(a, b) {
  if (!a.length) return b.length
  if (!b.length) return a.length
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0))
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[a.length][b.length]
}
function fuzzyMatch(userAnswer, accepted) {
  if (!userAnswer || !accepted?.length) return false
  const u = normalize(userAnswer)
  if (!u) return false
  return accepted.some(ans => {
    const a = normalize(ans)
    if (!a) return false
    if (u === a) return true
    const maxDist = a.length <= 4 ? 0 : a.length <= 8 ? 1 : a.length <= 14 ? 2 : 3
    return levenshtein(u, a) <= maxDist
  })
}
function getAccepted(m) {
  if (Array.isArray(m.accepted_answers)) return m.accepted_answers
  try { return JSON.parse(m.accepted_answers || '[]') } catch { return [] }
}
function getOptions(m) {
  if (Array.isArray(m.options)) return m.options
  try { return JSON.parse(m.options || '[]') } catch { return [] }
}
function getCorrectIndexes(m) {
  if (!m.is_multi) return [m.correct_index]
  if (Array.isArray(m.correct_indexes)) return m.correct_indexes
  try { return JSON.parse(m.correct_indexes || '[]') } catch { return [] }
}
function getTakeaways(cs) {
  if (Array.isArray(cs.key_takeaways)) return cs.key_takeaways
  try { return JSON.parse(cs.key_takeaways || '[]') } catch { return [] }
}
function isMissionCorrect(m, answer) {
  if (m.mission_type === 'open') return fuzzyMatch(String(answer ?? ''), getAccepted(m))
  const correct = getCorrectIndexes(m)
  if (m.is_multi) {
    const sel = Array.isArray(answer) ? [...answer].sort() : []
    return JSON.stringify(sel) === JSON.stringify([...correct].sort())
  }
  return answer === m.correct_index
}

const DIFFICULTY_CONFIG = {
  easy:         { label: 'Accessible',     color: '#065f46', bg: 'rgba(16,185,129,.1)',  border: 'rgba(16,185,129,.3)',  timeKey: 'time_easy' },
  intermediate: { label: 'Intermédiaire',  color: '#92400e', bg: 'rgba(245,158,11,.1)',  border: 'rgba(245,158,11,.3)',  timeKey: 'time_intermediate' },
  expert:       { label: 'Expert',         color: '#991b1b', bg: 'rgba(239,68,68,.1)',   border: 'rgba(239,68,68,.3)',   timeKey: 'time_expert' },
}
const LETTERS = ['A', 'B', 'C', 'D']

function fmt(secs) {
  const m = Math.floor(secs / 60), s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ─── Landing screen ─────────────────────────────────────────────── */
function Landing({ cs, onStart }) {
  const [chosen, setChosen] = useState(null)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: 'linear-gradient(160deg, #071a32 0%, #0B2545 60%, #163b6b 100%)' }}>

      {/* Sector badge */}
      {cs.sector && (
        <span className="mb-4 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(201,168,76,.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.3)' }}>
          {cs.sector}
        </span>
      )}

      <h1 className="font-serif font-extrabold text-center text-white mb-3"
        style={{ fontSize: 'clamp(24px,4vw,40px)', maxWidth: 720 }}>
        {cs.title}
      </h1>
      {cs.subtitle && (
        <p className="text-center mb-10 text-[15px]" style={{ color: 'rgba(255,255,255,.55)', maxWidth: 560 }}>
          {cs.subtitle}
        </p>
      )}

      {/* Difficulty cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10" style={{ maxWidth: 660 }}>
        {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => {
          const minutes = cs[cfg.timeKey]
          const selected = chosen === key
          return (
            <button key={key} onClick={() => setChosen(key)}
              className="rounded-2xl p-5 text-left transition-all border-2"
              style={{
                background: selected ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.03)',
                borderColor: selected ? '#C9A84C' : 'rgba(255,255,255,.1)',
                transform: selected ? 'scale(1.03)' : 'scale(1)',
              }}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2"
                style={{ color: selected ? '#C9A84C' : 'rgba(255,255,255,.4)' }}>
                {cfg.label}
              </div>
              <div className="font-serif font-extrabold text-white text-[28px] leading-none mb-1">
                {minutes} <span className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,.4)' }}>min</span>
              </div>
              <div className="text-[12px]" style={{ color: 'rgba(255,255,255,.35)' }}>
                {key === 'easy' ? 'Prendre son temps, construire son raisonnement' :
                 key === 'intermediate' ? 'Cadre d\'entretien standard' :
                 'Pression maximale — exactement comme en vrai'}
              </div>
            </button>
          )
        })}
      </div>

      <button onClick={() => chosen && onStart(chosen)}
        disabled={!chosen}
        className="font-bold text-[15px] px-10 py-4 rounded-2xl transition-all disabled:opacity-40"
        style={{
          background: chosen ? 'linear-gradient(135deg, #C9A84C, #a8873b)' : 'rgba(255,255,255,.1)',
          color: chosen ? '#071a32' : 'rgba(255,255,255,.4)',
          transform: chosen ? 'scale(1.02)' : 'scale(1)',
        }}>
        Démarrer le cas →
      </button>

      <p className="mt-6 text-[12px]" style={{ color: 'rgba(255,255,255,.25)' }}>
        Le timer démarre dès que vous cliquez. Bonne chance.
      </p>
    </div>
  )
}

/* ─── Timer bar ──────────────────────────────────────────────────── */
function TimerBar({ timeLeft, totalTime, difficulty }) {
  const pct = Math.max(0, timeLeft / totalTime)
  const color = pct > 0.4 ? '#10b981' : pct > 0.2 ? '#f59e0b' : '#ef4444'
  const urgent = pct <= 0.2
  return (
    <div className="sticky top-0 z-30 shadow-lg" style={{ background: '#071a32' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,.4)' }}>
            {DIFFICULTY_CONFIG[difficulty]?.label}
          </span>
        </div>
        <div className={`flex items-center gap-3 flex-shrink-0 ${urgent ? 'animate-pulse' : ''}`}>
          <div className="font-mono font-extrabold text-[22px]" style={{ color }}>
            {fmt(timeLeft)}
          </div>
          <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct * 100}%`, background: color }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mission item ───────────────────────────────────────────────── */
function MissionItem({ mission, idx, answer, onChange, submitted, isCorrect }) {
  const opts = getOptions(mission)
  const correctIdxs = getCorrectIndexes(mission)
  const accepted = getAccepted(mission)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-surface)' }}>
      <div className="px-6 py-4 flex items-start gap-3"
        style={{ background: 'var(--sf-surface-2, rgba(0,0,0,.02))', borderBottom: '1px solid var(--sf-border)' }}>
        <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-extrabold text-white"
          style={{ background: 'var(--sf-primary)' }}>{idx + 1}</span>
        <p className="text-[14px] font-semibold leading-relaxed" style={{ color: 'var(--sf-text)' }}>{mission.question}</p>
      </div>

      <div className="px-6 py-5">
        {mission.mission_type === 'open' ? (
          <div>
            <input
              disabled={submitted}
              value={answer ?? ''}
              onChange={e => onChange(e.target.value)}
              placeholder="Votre réponse…"
              className="w-full px-4 py-3 rounded-xl text-[14px] font-semibold focus:outline-none"
              style={{
                background: submitted
                  ? isCorrect ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)'
                  : 'var(--sf-surface)',
                border: `2px solid ${submitted ? (isCorrect ? '#10b981' : '#ef4444') : 'var(--sf-border)'}`,
                color: 'var(--sf-text)',
              }}
            />
            {submitted && (
              <p className="mt-2 text-[12.5px] font-semibold" style={{ color: isCorrect ? '#065f46' : '#991b1b' }}>
                {isCorrect ? '✓ Correct' : `✗ Réponse attendue : ${accepted[0]}`}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {opts.map((opt, oi) => {
              const isCorrectOpt = correctIdxs.includes(oi)
              const isSelected = mission.is_multi
                ? (Array.isArray(answer) && answer.includes(oi))
                : answer === oi

              let bg = 'var(--sf-surface)', border = 'var(--sf-border)', textColor = 'var(--sf-text)'
              if (submitted) {
                if (isCorrectOpt) { bg = 'rgba(16,185,129,.1)'; border = '#10b981'; textColor = '#065f46' }
                else if (isSelected && !isCorrectOpt) { bg = 'rgba(239,68,68,.08)'; border = '#ef4444'; textColor = '#991b1b' }
              } else if (isSelected) {
                bg = 'rgba(11,37,69,.07)'; border = 'var(--sf-primary)'; textColor = 'var(--sf-primary)'
              }

              return (
                <button key={oi} disabled={submitted}
                  onClick={() => {
                    if (mission.is_multi) {
                      const prev = Array.isArray(answer) ? answer : []
                      onChange(prev.includes(oi) ? prev.filter(x => x !== oi) : [...prev, oi])
                    } else {
                      onChange(oi)
                    }
                  }}
                  className="text-left flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all text-[13.5px] font-medium"
                  style={{ background: bg, borderColor: border, color: textColor }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold"
                    style={{ background: isSelected || (submitted && isCorrectOpt) ? border : 'var(--sf-border)', color: '#fff' }}>
                    {LETTERS[oi]}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {/* Correction explanation */}
        {submitted && mission.explanation && (
          <div className="mt-4 px-4 py-3 rounded-xl text-[12.5px] leading-relaxed"
            style={{ background: 'rgba(11,37,69,.05)', border: '1px solid var(--sf-border)', color: 'var(--sf-muted)' }}>
            <span className="font-bold" style={{ color: 'var(--sf-primary)' }}>Explication : </span>
            {mission.explanation}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Score banner ───────────────────────────────────────────────── */
function ScoreBanner({ score, total, timeUsed, totalTime }) {
  const pct = total ? Math.round((score / total) * 100) : 0
  const overtime = timeUsed > totalTime
  const { label, color, bg } =
    pct === 100 ? { label: '🏆 Parfait !',     color: '#065f46', bg: 'rgba(16,185,129,.12)' } :
    pct >= 80   ? { label: '🎉 Excellent',      color: '#065f46', bg: 'rgba(16,185,129,.10)' } :
    pct >= 60   ? { label: '💪 Bon travail',    color: '#92400e', bg: 'rgba(245,158,11,.12)' } :
    pct >= 40   ? { label: '📖 À retravailler', color: '#92400e', bg: 'rgba(245,158,11,.10)' } :
                  { label: '🔁 Continuez',       color: '#991b1b', bg: 'rgba(239,68,68,.10)' }

  return (
    <div className="rounded-2xl p-6 mb-8 text-center" style={{ background: bg, border: `1.5px solid ${color}22` }}>
      <div className="text-[28px] font-extrabold mb-1" style={{ color }}>{label}</div>
      <div className="text-[42px] font-serif font-extrabold leading-none mb-2" style={{ color: 'var(--sf-text)' }}>
        {score}<span className="text-[22px] text-gray-400">/{total}</span>
      </div>
      <div className="text-[14px]" style={{ color: 'var(--sf-muted)' }}>
        {pct} % de réussite · {fmt(timeUsed)} utilisées
        {overtime && <span className="ml-2 text-red-500 font-semibold">(temps dépassé)</span>}
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function CaseStudyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cs, setCs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [phase, setPhase] = useState('landing')
  const [difficulty, setDifficulty] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const timerRef = useRef(null)

  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)

  useEffect(() => {
    getCaseStudy(id).then(({ data, error }) => {
      if (error || !data) setError(error || 'Cas introuvable')
      else setCs(data)
      setLoading(false)
    })
  }, [id])

  function startCase(diff) {
    const minutes = cs[DIFFICULTY_CONFIG[diff].timeKey]
    const secs = minutes * 60
    setDifficulty(diff)
    setTotalTime(secs)
    setTimeLeft(secs)
    setStartedAt(Date.now())
    setPhase('active')
  }

  useEffect(() => {
    if (phase !== 'active' || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, submitted])

  function handleSubmit(autoSubmit = false) {
    clearInterval(timerRef.current)
    const missions = cs.case_study_missions || []
    const timeUsed = startedAt ? Math.round((Date.now() - startedAt) / 1000) : totalTime
    let score = 0
    const corrected = missions.map((m, i) => {
      const ans = answers[i]
      const correct = isMissionCorrect(m, ans)
      if (correct) score += (m.points || 1)
      return { ...m, userAnswer: ans, isCorrect: correct }
    })
    const total = missions.reduce((s, m) => s + (m.points || 1), 0)
    setResults({ score, total, corrected, timeUsed, autoSubmit })
    setSubmitted(true)
    setPhase('correction')
  }

  function setAnswer(idx, val) {
    setAnswers(p => ({ ...p, [idx]: val }))
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#071a32' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
    </div>
  )
  if (error) return (
    <div className="flex items-center justify-center min-h-screen text-center px-6" style={{ background: '#071a32' }}>
      <div>
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-white font-semibold mb-4">{error}</p>
        <button onClick={() => navigate('/cours')} className="text-sm underline" style={{ color: '#C9A84C' }}>Retour aux cours</button>
      </div>
    </div>
  )

  if (phase === 'landing') return <Landing cs={cs} onStart={startCase} />

  const missions = cs.case_study_missions || []
  const takeaways = getTakeaways(cs)

  return (
    <div style={{ background: 'var(--sf-bg)', minHeight: '100vh' }}>
      {/* Timer */}
      {phase === 'active' && (
        <TimerBar timeLeft={timeLeft} totalTime={totalTime} difficulty={difficulty} />
      )}

      {/* Correction header */}
      {phase === 'correction' && (
        <div className="sticky top-0 z-30 shadow" style={{ background: '#071a32' }}>
          <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
            <span className="font-bold text-white text-[14px]">Correction — {cs.title}</span>
            <button onClick={() => navigate('/cours?tab=exercices')}
              className="text-[12px] font-semibold px-4 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}>
              ← Retour aux cours
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {phase === 'correction' && results && (
          <ScoreBanner score={results.score} total={results.total} timeUsed={results.timeUsed} totalTime={totalTime} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">

          {/* Left — brief context */}
          <div>
            {/* Case header */}
            <div className="rounded-2xl p-6 mb-6"
              style={{ background: 'linear-gradient(135deg, #071a32 0%, #0B2545 100%)', border: '1px solid rgba(201,168,76,.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                {cs.sector && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: 'rgba(201,168,76,.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.3)' }}>
                    {cs.sector}
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)' }}>
                  {DIFFICULTY_CONFIG[difficulty]?.label}
                </span>
              </div>
              <h1 className="font-serif font-extrabold text-white text-[22px] leading-snug">{cs.title}</h1>
              {cs.subtitle && <p className="mt-1 text-[13px]" style={{ color: 'rgba(255,255,255,.5)' }}>{cs.subtitle}</p>}
            </div>

            {/* Context / brief */}
            <div className="rounded-2xl p-7" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }}>
              <h2 className="font-bold text-[13px] uppercase tracking-widest mb-4" style={{ color: 'var(--sf-primary)' }}>
                📋 Dossier de cas
              </h2>
              <div className="prose prose-sm max-w-none text-[14px] leading-[1.85]" style={{ color: 'var(--sf-text)' }}>
                {cs.context.split('\n').map((line, i) => (
                  line.trim() === '' ? <div key={i} className="h-3" /> : <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            {/* Key takeaways — visible in correction only */}
            {phase === 'correction' && takeaways.length > 0 && (
              <div className="mt-6 rounded-2xl p-6"
                style={{ background: 'linear-gradient(135deg, rgba(201,168,76,.08), rgba(201,168,76,.03))', border: '1.5px solid rgba(201,168,76,.35)' }}>
                <h3 className="font-bold text-[13px] uppercase tracking-widest mb-4" style={{ color: '#8a6012' }}>
                  ⭐ Points clés à retenir
                </h3>
                <ul className="space-y-2.5">
                  {takeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13.5px]" style={{ color: 'var(--sf-text)' }}>
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold mt-0.5"
                        style={{ background: 'rgba(201,168,76,.25)', color: '#8a6012' }}>{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — missions */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-[13px] uppercase tracking-widest" style={{ color: 'var(--sf-primary)' }}>
                Vos missions ({missions.length})
              </h2>
              {phase === 'active' && (
                <span className="text-[11px]" style={{ color: 'var(--sf-muted)' }}>
                  {Object.keys(answers).length}/{missions.length} répondu{Object.keys(answers).length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {missions.map((m, i) => {
              const corrected = results?.corrected?.[i]
              return (
                <MissionItem
                  key={m.id}
                  mission={m}
                  idx={i}
                  answer={answers[i]}
                  onChange={val => setAnswer(i, val)}
                  submitted={submitted}
                  isCorrect={corrected?.isCorrect}
                />
              )
            })}

            {/* Submit button */}
            {phase === 'active' && (
              <button onClick={() => handleSubmit(false)}
                className="w-full py-4 rounded-2xl font-extrabold text-[14px] transition-all mt-2"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #a8873b)', color: '#071a32' }}>
                Remettre ma copie →
              </button>
            )}

            {phase === 'correction' && (
              <button onClick={() => navigate('/cours')}
                className="w-full py-4 rounded-2xl font-bold text-[14px] transition-all"
                style={{ background: 'var(--sf-surface)', border: '1.5px solid var(--sf-border)', color: 'var(--sf-text)' }}>
                ← Retour aux cours
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
