import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getCoursesByModule } from '../services/coursesService'
import { getExercises, getExerciseQuestions, saveExerciseResult } from '../services/exercisesService'
import PartnersScrollBanner from '../components/PartnersScrollBanner'

const DIFF_COLOR = {
  Débutant:     { bg: 'rgba(16,185,129,.1)', color: '#065f46' },
  Intermédiaire:{ bg: 'rgba(11,37,69,.08)',  color: 'var(--sf-primary)' },
  Avancé:       { bg: 'rgba(245,158,11,.1)', color: '#92400e' },
  Expert:       { bg: 'rgba(239,68,68,.1)',  color: '#991b1b' },
}

const LETTERS = ['A', 'B', 'C', 'D']

function getCorrectIndexes(q) {
  if (!q.is_multi) return [q.correct_index]
  if (Array.isArray(q.correct_indexes)) return q.correct_indexes
  try { return JSON.parse(q.correct_indexes || '[]') } catch { return [] }
}

function isQuestionCorrect(q, selectedAnswer) {
  const correctIdxs = getCorrectIndexes(q)
  if (q.is_multi) {
    const sel = Array.isArray(selectedAnswer) ? [...selectedAnswer].sort() : []
    return JSON.stringify(sel) === JSON.stringify([...correctIdxs].sort())
  }
  return selectedAnswer === q.correct_index
}

/* ─── Exercise Player ─────────────────────────────────────────── */
function ExercisePlayer({ exercise, onClose, user }) {
  const [questions,  setQuestions]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [answers,    setAnswers]    = useState({})   // { [qIdx]: selectedIndex }
  const [submitted,  setSubmitted]  = useState(false)
  const [result,     setResult]     = useState(null)
  const [startTime]                 = useState(Date.now())

  useEffect(() => {
    getExerciseQuestions(exercise.id).then(({ data }) => {
      setQuestions(data); setLoading(false)
    })
  }, [exercise.id])

  const allAnswered = questions.length > 0 && questions.every((q, i) => {
    if (q.is_multi) return Array.isArray(answers[i]) && answers[i].length > 0
    return answers[i] !== undefined
  })

  async function handleSubmit() {
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    let score = 0
    const answersArr = questions.map((q, i) => {
      const sel = q.is_multi ? (Array.isArray(answers[i]) ? answers[i] : []) : (answers[i] ?? -1)
      if (isQuestionCorrect(q, sel)) score++
      return sel
    })
    const { attemptNumber } = await saveExerciseResult({
      userId: user?.id, exerciseId: exercise.id,
      score, total: questions.length, answers: answersArr, timeSeconds: elapsed,
    })
    const pct = Math.round((score / questions.length) * 100)
    const wrongIdxs = questions.map((q, i) => isQuestionCorrect(q, answersArr[i]) ? null : i).filter(i => i !== null)
    setResult({ score, total: questions.length, pct, elapsed, attemptNumber: attemptNumber ?? 1, wrongIdxs, answersArr })
    setSubmitted(true)
  }

  function badge(pct) {
    if (pct === 100) return { label: '🏆 Parfait !',    color: '#065f46', bg: 'rgba(16,185,129,.12)' }
    if (pct >= 80)   return { label: '🎉 Excellent',    color: '#065f46', bg: 'rgba(16,185,129,.10)' }
    if (pct >= 60)   return { label: '💪 Bien joué',    color: '#92400e', bg: 'rgba(245,158,11,.12)' }
    return               { label: '📖 À réviser',       color: '#991b1b', bg: 'rgba(239,68,68,.10)' }
  }

  function fmtTime(s) {
    const m = Math.floor(s / 60), sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,.55)' }}>
      <div className="bg-white rounded-2xl p-10 text-center">
        <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto mb-3"
          style={{ borderColor: 'var(--sf-primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm text-gray-500">Chargement des questions…</p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(0,0,0,.55)' }}>
      <div className="min-h-screen flex items-start justify-center py-8 px-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--sf-border)' }}>
            <div>
              <div className="text-[11px] font-bold tracking-wide uppercase text-gray-400 mb-0.5">Exercice</div>
              <h2 className="font-bold text-[16px] text-gray-900">{exercise.title}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg">✕</button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="text-5xl mb-4">❓</div>
              <p className="font-semibold text-gray-700 mb-1">Aucune question disponible</p>
              <p className="text-sm text-gray-400">Les questions n'ont pas encore été ajoutées par l'administrateur.</p>
            </div>
          ) : !submitted ? (
            /* ── Questions ── */
            <div className="p-6 space-y-8">
              <p className="text-sm text-gray-500">{questions.length} question{questions.length > 1 ? 's' : ''} — répondez à toutes pour valider</p>

              {questions.map((q, qi) => {
                const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
                return (
                  <div key={q.id}>
                    <div className="mb-3">
                      {q.is_multi && (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 mb-1.5">
                          ☑️ Plusieurs bonnes réponses possibles
                        </span>
                      )}
                      <p className="font-semibold text-[14px] text-gray-900 leading-snug">
                        <span className="text-gray-400 font-bold mr-2">{qi + 1}.</span>{q.question}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {opts.map((opt, oi) => {
                        const selected = q.is_multi
                          ? (Array.isArray(answers[qi]) && answers[qi].includes(oi))
                          : answers[qi] === oi
                        const accentColor = q.is_multi ? '#7c3aed' : 'var(--sf-primary)'
                        const toggleAnswer = () => {
                          if (q.is_multi) {
                            setAnswers(a => {
                              const cur = Array.isArray(a[qi]) ? a[qi] : []
                              return { ...a, [qi]: cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi] }
                            })
                          } else {
                            setAnswers(a => ({ ...a, [qi]: oi }))
                          }
                        }
                        return (
                          <button key={oi} onClick={toggleAnswer}
                            className="w-full text-left px-4 py-3 rounded-xl text-[13px] font-medium transition-all flex items-center gap-3"
                            style={{
                              border: selected ? `2px solid ${accentColor}` : '1.5px solid var(--sf-border)',
                              background: selected ? (q.is_multi ? 'rgba(124,58,237,.05)' : 'rgba(11,37,69,.05)') : 'var(--sf-surface)',
                              color: 'var(--sf-text)',
                            }}>
                            <span className="w-6 h-6 flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{
                                borderRadius: q.is_multi ? '4px' : '50%',
                                background: selected ? accentColor : 'var(--sf-border)',
                                color: selected ? '#fff' : 'var(--sf-muted)',
                              }}>
                              {q.is_multi ? (selected ? '✓' : '') : LETTERS[oi]}
                            </span>
                            <span className="font-semibold mr-1" style={{ color: 'var(--sf-muted)', fontSize: 11 }}>{LETTERS[oi]}.</span>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <button onClick={handleSubmit} disabled={!allAnswered}
                className="w-full py-3 rounded-xl font-bold text-[14px] transition-all disabled:opacity-40"
                style={{ background: allAnswered ? 'var(--sf-primary)' : 'var(--sf-border)', color: '#fff' }}>
                {allAnswered ? 'Valider mes réponses →' : `Répondez à toutes les questions (${Object.keys(answers).length}/${questions.length})`}
              </button>
            </div>
          ) : (
            /* ── Correction ── */
            <div className="p-6">
              {/* Score card */}
              {result && (() => {
                const b = badge(result.pct)
                return (
                  <div className="rounded-2xl p-5 mb-6 text-center" style={{ background: b.bg }}>
                    <div className="text-4xl font-extrabold mb-1" style={{ fontFamily: 'var(--sf-font-heading)', color: b.color }}>
                      {result.score}<span className="text-2xl opacity-50">/{result.total}</span>
                    </div>
                    <div className="text-[13px] font-bold mb-2" style={{ color: b.color }}>{b.label}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      {[
                        { val: `${result.pct}%`,                             label: 'Réussite' },
                        { val: fmtTime(result.elapsed),                       label: 'Temps' },
                        { val: `${result.attemptNumber}${result.attemptNumber === 1 ? 'ère' : 'ème'}`, label: 'Tentative' },
                        { val: `${result.total - result.wrongIdxs.length}/${result.total}`, label: 'Correctes' },
                      ].map(({ val, label }) => (
                        <div key={label} className="bg-white/60 rounded-xl py-2 px-3 text-center">
                          <div className="font-extrabold text-[18px]" style={{ color: b.color }}>{val}</div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
                        </div>
                      ))}
                    </div>
                    {result.wrongIdxs.length > 0 && (
                      <p className="text-[11px] mt-3 opacity-70">
                        Questions à revoir : {result.wrongIdxs.map(i => i + 1).join(', ')}
                      </p>
                    )}
                  </div>
                )
              })()}

              {/* Per-question correction */}
              <div className="space-y-6">
                {questions.map((q, qi) => {
                  const opts        = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
                  const correctIdxs = getCorrectIndexes(q)
                  const rawSel      = result.answersArr[qi]
                  const selArr      = q.is_multi ? (Array.isArray(rawSel) ? rawSel : []) : (rawSel ?? -1) >= 0 ? [rawSel] : []
                  const isOk        = isQuestionCorrect(q, q.is_multi ? selArr : (rawSel ?? -1))
                  return (
                    <div key={q.id}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {isOk ? '✓' : '✗'}
                        </span>
                        <div>
                          {q.is_multi && (
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 mb-1">
                              ☑️ Plusieurs bonnes réponses
                            </span>
                          )}
                          <p className="font-semibold text-[13px] text-gray-900 leading-snug">{qi + 1}. {q.question}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 pl-7">
                        {opts.map((opt, oi) => {
                          const isCorrectOpt  = correctIdxs.includes(oi)
                          const isSelectedOpt = selArr.includes(oi)
                          let style = { border: '1.5px solid var(--sf-border)', background: 'transparent', color: 'var(--sf-muted)' }
                          if (isCorrectOpt)                          style = { border: '2px solid #10b981', background: 'rgba(16,185,129,.08)', color: '#065f46' }
                          else if (isSelectedOpt && !isCorrectOpt)   style = { border: '2px solid #ef4444', background: 'rgba(239,68,68,.06)', color: '#991b1b', textDecoration: 'line-through' }
                          return (
                            <div key={oi} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium" style={style}>
                              <span className="font-bold w-4 flex-shrink-0">{LETTERS[oi]}.</span>
                              {opt}
                              {isCorrectOpt && <span className="ml-auto font-bold text-emerald-600">✓</span>}
                            </div>
                          )
                        })}
                      </div>
                      {q.explanation && (
                        <div className="mt-2 pl-7 text-[12px] text-gray-600 leading-relaxed border-l-2 border-indigo-200 pl-4 ml-7 italic">
                          💡 {q.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border font-semibold text-sm text-gray-600 hover:bg-gray-50">
                  Fermer
                </button>
                <button onClick={() => { setAnswers({}); setSubmitted(false); setResult(null) }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                  style={{ background: 'var(--sf-primary)' }}>
                  Recommencer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Course Item (nested, with PDF) ──────────────────────────── */
function CourseItem({ course, idx, exercises }) {
  const [open, setOpen] = useState(false)
  const linked = exercises.filter(ex => ex.chapter_id === course.id)

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--sf-border)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
        style={{ background: open ? 'rgba(11,37,69,.03)' : 'transparent' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0"
          style={!course.is_premium
            ? { background: 'rgba(16,185,129,.1)', color: '#059669' }
            : { background: 'rgba(11,37,69,.07)', color: 'var(--sf-primary)' }}>
          {idx + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--sf-text)' }}>{course.title}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {course.duration && <span className="text-[11px]" style={{ color: 'var(--sf-muted)' }}>⏱ {course.duration}</span>}
            {!course.is_premium && <span className="badge badge-success" style={{ fontSize: 10 }}>Gratuit</span>}
            {course.pdf_url && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(11,37,69,.07)', color: 'var(--sf-primary)' }}>📄 PDF</span>}
            {linked.length > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,.08)', color: '#4f46e5' }}>✏️ {linked.length} exercice{linked.length > 1 ? 's' : ''}</span>}
          </div>
        </div>
        {course.is_premium && <div className="flex-shrink-0 text-[11px]" style={{ color: 'var(--sf-muted)' }}>🔒</div>}
        <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--sf-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t" style={{ borderColor: 'var(--sf-border)' }}>
          {course.pdf_url ? (
            <iframe
              src={/\.(pptx?|ppt)$/i.test(course.pdf_url)
                ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(course.pdf_url)}`
                : course.pdf_url}
              title={course.title}
              className="w-full block" style={{ height: 620, border: 'none' }} />
          ) : (
            <div className="px-4 py-6 text-center text-[13px]" style={{ color: 'var(--sf-muted)' }}>
              Aucun contenu disponible pour ce cours.
            </div>
          )}
          {linked.length > 0 && (
            <div className="px-4 py-3 border-t" style={{ background: 'rgba(99,102,241,.04)', borderColor: 'rgba(99,102,241,.15)' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#4f46e5' }}>Exercice{linked.length > 1 ? 's' : ''} associé{linked.length > 1 ? 's' : ''}</p>
              <div className="flex flex-wrap gap-2">
                {linked.map(ex => (
                  <span key={ex.id} className="text-[12px] font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">
                    {ex.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Module Card ─────────────────────────────────────────────── */
function ModuleCard({ module, exercises }) {
  const [open, setOpen] = useState(false)
  const freeCount = module.courses.filter(c => !c.is_premium).length
  const diff = DIFF_COLOR[module.level] || DIFF_COLOR.Débutant

  return (
    <div className="mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all"
        style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', boxShadow: 'var(--sf-shadow-xs)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0 text-white"
          style={{ background: 'var(--sf-primary)' }}>
          {module.cover_url ? <img src={module.cover_url} alt="" className="w-full h-full object-cover rounded-xl" /> : '📚'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <div className="text-[14px] font-bold leading-snug" style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}>
              {module.title}
            </div>
            {module.level && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: diff.bg, color: diff.color }}>
                {module.level}
              </span>
            )}
          </div>
          <div className="text-[11.5px]" style={{ color: 'var(--sf-muted)' }}>
            {module.courses.length} cours
            {module.courses.length > 0 && freeCount > 0 ? ` · ${freeCount} gratuit${freeCount > 1 ? 's' : ''}` : module.courses.length > 0 ? ' · Premium' : ''}
            {module.duration ? ` · ${module.duration}` : ''}
          </div>
        </div>
        <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'var(--sf-accent)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2 pl-2">
          {module.courses.length === 0 ? (
            <p className="text-[12px] text-center py-4" style={{ color: 'var(--sf-muted)' }}>Aucun cours dans ce module pour l'instant.</p>
          ) : (
            module.courses.map((c, i) => <CourseItem key={c.id || i} course={c} idx={i} exercises={exercises} />)
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Exercise Card ───────────────────────────────────────────── */
function ExerciseCard({ ex, onStart }) {
  const diff = DIFF_COLOR[ex.difficulty] || DIFF_COLOR.Intermédiaire
  return (
    <div className="card card-hover flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: 'rgba(99,102,241,.08)' }}>✏️</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[13.5px] font-semibold" style={{ color: 'var(--sf-text)' }}>{ex.title}</span>
          <span className="badge text-[10px]" style={{ background: diff.bg, color: diff.color }}>{ex.difficulty}</span>
        </div>
        {ex.description && <div className="text-[12px] leading-relaxed" style={{ color: 'var(--sf-muted)' }}>{ex.description}</div>}
        {ex.chapters?.title && (
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--sf-muted)' }}>
            📖 {ex.chapters.title}
          </div>
        )}
      </div>
      <button onClick={() => onStart(ex)} className="btn btn-primary btn-sm flex-shrink-0">Démarrer →</button>
    </div>
  )
}

function ErrorBlock({ message }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Erreur de chargement</p>
      <p className="text-[13px]" style={{ color: '#b91c1c' }}>{message}</p>
    </div>
  )
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-semibold text-[15px] mb-1" style={{ color: 'var(--sf-text)' }}>{title}</p>
      <p className="text-[13px]" style={{ color: 'var(--sf-muted)' }}>{subtitle}</p>
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────────────── */
export default function Courses() {
  const { user }                          = useAuth()
  const [modules,     setModules]         = useState([])
  const [exercises,   setExercises]       = useState([])
  const [modErr,      setModErr]          = useState(null)
  const [exErr,       setExErr]           = useState(null)
  const [tab,         setTab]             = useState('programme')
  const [loading,     setLoading]         = useState(true)
  const [activeEx,    setActiveEx]        = useState(null)

  useEffect(() => {
    Promise.all([getCoursesByModule(), getExercises()]).then(([mr, er]) => {
      setModules(mr.data); setModErr(mr.error)
      setExercises(er.data); setExErr(er.error)
      setLoading(false)
    })
  }, [])

  const totalCourses = modules.reduce((s, m) => s + m.courses.length, 0)

  const TABS = [
    { id: 'programme', label: 'Programme' },
    { id: 'exercices', label: `Exercices${exercises.length > 0 ? ` (${exercises.length})` : ''}` },
  ]

  return (
    <div className="pt-[64px]">

      {/* Exercise player modal */}
      {activeEx && <ExercisePlayer exercise={activeEx} onClose={() => setActiveEx(null)} user={user} />}

      {/* Hero */}
      <section style={{ background: 'linear-gradient(155deg, #071a32 0%, var(--sf-primary) 55%, #163b6b 100%)' }} className="px-6 lg:px-10 py-12">
        <div className="max-w-[860px] mx-auto text-center">
          <span className="eyebrow justify-center flex" style={{ color: 'rgba(201,168,76,.8)' }}>Formation complète</span>
          <h1 className="font-serif font-extrabold text-white leading-tight mb-3" style={{ fontSize: 'clamp(26px, 3.5vw, 42px)' }}>
            Une formation complète en sport business,{' '}
            <span style={{ color: 'var(--sf-accent)' }}>finance et stratégie</span>
          </h1>
          <p className="max-w-lg mx-auto leading-relaxed mb-7 text-[14px]" style={{ color: 'rgba(255,255,255,.6)' }}>
            Conçue par des praticiens ayant 20 ans+ d'expérience dans des clubs, ligues et institutions sportives.
          </p>
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <button onClick={() => setTab('programme')} className="btn btn-accent btn-lg">Voir le programme →</button>
            <button onClick={() => setTab('exercices')} className="btn btn-white btn-lg">Exercices pratiques</button>
          </div>
          <div className="flex items-center justify-center flex-wrap gap-0">
            {[
              [loading ? '…' : `${modules.length}`,    'Modules'],
              [loading ? '…' : `${totalCourses}+`,     'Cours'],
              [loading ? '…' : `${exercises.length}`,  'Exercices'],
              ['100%',                                   'Praticiens'],
            ].map(([n, l], i) => (
              <div key={l} className="flex items-center">
                {i > 0 && <div className="h-6 w-px mx-5" style={{ background: 'rgba(255,255,255,.15)' }} />}
                <div>
                  <div className="font-extrabold text-white text-xl font-serif leading-none">{n}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners banner */}
      <PartnersScrollBanner />

      {/* Tabs */}
      <div className="sticky top-[64px] z-10 border-b" style={{ background: 'var(--sf-surface)', borderColor: 'var(--sf-border)' }}>
        <div className="max-w-[1360px] mx-auto px-6 lg:px-10 flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="py-3.5 px-5 text-[13px] font-semibold border-b-2 transition-all -mb-px"
              style={tab === t.id
                ? { borderColor: 'var(--sf-accent)', color: 'var(--sf-primary)' }
                : { borderColor: 'transparent', color: 'var(--sf-muted)' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">

        {/* PROGRAMME */}
        {tab === 'programme' && (
          <div className="max-w-[820px] mx-auto">
            <div className="mb-7">
              <h2 className="section-title mb-1">
                {loading ? 'Chargement…' : `${modules.length} Module${modules.length > 1 ? 's' : ''} · ${totalCourses} Cours`}
              </h2>
              <p className="section-sub text-[14px]">Cliquez sur un cours pour lire le PDF et accéder aux exercices.</p>
            </div>

            {loading && <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-[72px] skeleton rounded-2xl" />)}</div>}
            {!loading && modErr && <ErrorBlock message={modErr} />}
            {!loading && !modErr && modules.length === 0 && (
              <EmptyState icon="📚" title="Le programme arrive bientôt" subtitle="Les modules sont en cours de mise en ligne." />
            )}
            {!loading && !modErr && modules.map(m => <ModuleCard key={m.id} module={m} exercises={exercises} />)}

            {/* Module Gold */}
            {!loading && !modErr && modules.length > 0 && (
              <div className="mt-8 rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid rgba(201,168,76,.45)', background: 'linear-gradient(135deg, rgba(201,168,76,.07) 0%, rgba(201,168,76,.02) 100%)' }}>
                <div className="px-5 py-3 flex items-center gap-3 flex-wrap"
                  style={{ background: 'linear-gradient(90deg, rgba(201,168,76,.18), rgba(201,168,76,.06))', borderBottom: '1px solid rgba(201,168,76,.22)' }}>
                  <span className="text-[17px]">👑</span>
                  <span className="font-bold text-[13px] tracking-wide" style={{ color: '#8a6012' }}>MODULE GOLD — Avancé</span>
                  <span className="ml-auto text-[10px] font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(201,168,76,.18)', color: '#7a5810', border: '1px solid rgba(201,168,76,.35)' }}>
                    Plan Premium
                  </span>
                </div>
                <div className="p-5 lg:p-6">
                  <h3 className="font-serif font-extrabold text-[19px] mb-1.5" style={{ color: 'var(--sf-text)' }}>
                    Private Equity, M&A & Multipropriété dans le sport
                  </h3>
                  <p className="text-[13px] mb-5 max-w-xl" style={{ color: 'var(--sf-muted)' }}>
                    Le module qui fait la différence en entretien : valorisation de clubs, stratégies d'acquisition, montages financiers complexes et multipropriété internationale.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {[
                      { icon: '📈', title: 'Private Equity dans le sport', sub: '6 cours · Avancé' },
                      { icon: '🤝', title: 'M&A & Sport Business', sub: '5 cours · Avancé' },
                      { icon: '🏟️', title: 'Multipropriété de clubs', sub: '4 cours · Expert' },
                    ].map(m => (
                      <div key={m.title} className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ background: 'rgba(201,168,76,.07)', border: '1px solid rgba(201,168,76,.18)' }}>
                        <span className="text-[22px] flex-shrink-0 mt-0.5">{m.icon}</span>
                        <div>
                          <div className="text-[13px] font-bold leading-snug mb-0.5" style={{ color: 'var(--sf-text)' }}>{m.title}</div>
                          <div className="text-[11px]" style={{ color: 'var(--sf-muted)' }}>{m.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">🔒</span>
                    <span className="text-[12.5px] font-medium" style={{ color: 'var(--sf-muted)' }}>
                      Accessible avec le plan <span className="font-bold" style={{ color: '#8a6012' }}>Premium 39,99€/mois</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXERCICES */}
        {tab === 'exercices' && (
          <>
            <div className="mb-7">
              <span className="eyebrow">Mise en pratique</span>
              <h2 className="section-title mb-1">
                {loading ? 'Chargement…' : exercises.length > 0 ? `${exercises.length} Exercices pratiques` : 'Exercices pratiques'}
              </h2>
              <p className="section-sub text-[14px]">
                QCM auto-corrigés — répondez à toutes les questions puis obtenez votre score et la correction détaillée.
              </p>
            </div>

            {loading && <div className="space-y-3 max-w-[860px]">{[1,2,3].map(i => <div key={i} className="h-[80px] skeleton rounded-2xl" />)}</div>}
            {!loading && exErr && <ErrorBlock message={exErr} />}
            {!loading && !exErr && exercises.length === 0 && (
              <EmptyState icon="✏️" title="Les exercices arrivent bientôt" subtitle="Le contenu est en cours de mise en ligne." />
            )}
            {!loading && !exErr && exercises.length > 0 && (
              <div className="flex flex-col gap-3 max-w-[860px]">
                {exercises.map(ex => <ExerciseCard key={ex.id} ex={ex} onStart={setActiveEx} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
