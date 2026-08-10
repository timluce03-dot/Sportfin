import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getQuizzes, getQuizQuestions, saveQuizResult, getUserResults } from '../services/quizzesService'

const ACHIEVEMENTS = [
  { id: 1, icon: '🎯', label: 'Premier quiz',     desc: 'Complétez votre 1er quiz',    unlocked: true  },
  { id: 2, icon: '🔥', label: 'Streak 7j',        desc: '7 jours consécutifs',          unlocked: true  },
  { id: 3, icon: '💎', label: 'Expert Droits TV',  desc: '100% sur un quiz Droits TV',  unlocked: false },
  { id: 4, icon: '🚀', label: 'Top 100',           desc: 'Atteindre le rang #100',       unlocked: false },
  { id: 5, icon: '📚', label: 'Marathonien',       desc: '10 quiz complétés',            unlocked: false },
  { id: 6, icon: '🏆', label: 'Champion',          desc: 'Atteindre le rang #1',         unlocked: false },
  { id: 7, icon: '⚡', label: 'Speed run',         desc: 'Quiz en moins de 3 min',      unlocked: false },
  { id: 8, icon: '🎓', label: 'Certifiable',       desc: 'Tous les quiz à 80%+',         unlocked: false },
]

const DIFF_STYLE = {
  Débutant:     { bg: 'rgba(16,185,129,.1)', color: '#065f46' },
  Intermédiaire:{ bg: 'rgba(11,37,69,.08)',  color: 'var(--sf-primary)' },
  Avancé:       { bg: 'rgba(239,68,68,.1)',  color: '#991b1b' },
}

/* ── Quiz Player ─────────────────────────────────────────── */
function QuizPlayer({ quiz, onFinish }) {
  const { user } = useAuth()
  const [questions,      setQuestions]      = useState([])
  const [qErr,           setQErr]           = useState(null)
  const [cur,            setCur]            = useState(0)
  const [selected,       setSelected]       = useState(null)
  const [validated,      setValidated]      = useState(false)
  const [score,          setScore]          = useState(0)
  const [done,           setDone]           = useState(false)
  const [loading,        setLoading]        = useState(true)
  const [wasFirstAttempt, setWasFirstAttempt] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    getQuizQuestions(quiz.id).then(({ data, error }) => {
      setQuestions(data)
      setQErr(error)
      setLoading(false)
    })
  }, [quiz.id])

  function validate() {
    if (selected === null) return
    setValidated(true)
    if (selected === questions[cur].correct_index) setScore(s => s + 1)
  }

  async function next() {
    if (cur + 1 >= questions.length) {
      setDone(true)
      const saved = await saveQuizResult({ userId: user?.id, quizId: quiz.id, score, total: questions.length })
      setWasFirstAttempt(saved)
    } else {
      setCur(c => c + 1); setSelected(null); setValidated(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--sf-primary)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (qErr) return (
    <div className="text-center py-20">
      <div className="text-4xl mb-3">⚠️</div>
      <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Impossible de charger les questions</p>
      <p className="text-[13px] mb-5" style={{ color: '#b91c1c' }}>{qErr}</p>
      <button onClick={onFinish} className="btn btn-outline btn-sm">← Retour</button>
    </div>
  )

  if (questions.length === 0) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">❓</div>
      <p className="font-semibold text-[15px] mb-1" style={{ color: 'var(--sf-text)' }}>Aucune question disponible</p>
      <p className="text-[13px] mb-6" style={{ color: 'var(--sf-muted)' }}>Les questions de ce quiz n'ont pas encore été ajoutées.</p>
      <button onClick={onFinish} className="btn btn-outline btn-sm">← Retour</button>
    </div>
  )

  if (done) {
    const pct     = Math.round((score / questions.length) * 100)
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    const mins    = Math.floor(elapsed / 60)
    const secs    = elapsed % 60
    return (
      <div className="max-w-md mx-auto text-center py-14 px-4">
        <div className="text-7xl font-extrabold mb-1" style={{ fontFamily: 'var(--sf-font-heading)', color: 'var(--sf-primary)' }}>
          {score}<span className="text-4xl text-gray-300">/{questions.length}</span>
        </div>
        <div className="text-[13px] mb-2" style={{ color: 'var(--sf-muted)' }}>{pct}% de réussite</div>
        {wasFirstAttempt ? (
          <p className={`text-[15px] font-semibold mb-2 ${pct >= 70 ? 'text-emerald-600' : 'text-amber-500'}`}>
            {pct >= 80 ? '🎉 Excellent ! +150 XP gagnés' : pct >= 60 ? '💪 Bien joué ! +80 XP' : '📖 Continuez à réviser — +30 XP'}
          </p>
        ) : (
          <p className="text-[14px] font-semibold mb-2 text-gray-400">
            🔁 Score non comptabilisé — seule la 1re tentative compte pour le classement
          </p>
        )}
        <p className="text-[12px] mb-8" style={{ color: 'var(--sf-muted)' }}>
          Temps : {mins > 0 ? `${mins}m ` : ''}{secs}s
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onFinish} className="btn btn-outline btn-sm">← Retour aux quiz</button>
          <button onClick={() => { setCur(0); setSelected(null); setValidated(false); setScore(0); setDone(false); setWasFirstAttempt(true) }}
            className="btn btn-primary btn-sm">Rejouer</button>
        </div>
      </div>
    )
  }

  const q        = questions[cur]
  const progress = ((cur + 1) / questions.length) * 100
  const opts     = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')

  return (
    <div className="max-w-[600px] mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-[12px] font-medium flex-shrink-0" style={{ color: 'var(--sf-muted)' }}>
          {cur + 1} / {questions.length}
        </span>
        <div className="flex-1 progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[12px] font-bold flex-shrink-0" style={{ color: 'var(--sf-accent)' }}>
          {score} pts
        </span>
      </div>

      <h2 className="font-serif text-[20px] font-bold mb-7 leading-snug" style={{ color: 'var(--sf-text)' }}>
        {q.question}
      </h2>

      <div className="flex flex-col gap-3 mb-7">
        {opts.map((opt, i) => {
          let bg = 'var(--sf-surface)', border = 'var(--sf-border)', color = 'var(--sf-text)'
          if (!validated) {
            if (selected === i) { border = 'var(--sf-primary)'; bg = 'rgba(11,37,69,.05)' }
          } else {
            if (i === q.correct_index)  { border = '#10b981'; bg = 'rgba(16,185,129,.08)'; color = '#065f46' }
            else if (i === selected)    { border = '#ef4444'; bg = 'rgba(239,68,68,.08)'; color = '#991b1b' }
            else                        { bg = 'var(--sf-surface)'; border = 'var(--sf-border)'; color = 'var(--sf-muted)' }
          }
          return (
            <button key={i} onClick={() => !validated && setSelected(i)}
              className="w-full text-left px-5 py-3.5 rounded-xl text-[14px] font-medium transition-all"
              style={{ background: bg, border: `1.5px solid ${border}`, color, cursor: validated ? 'default' : 'pointer' }}>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold mr-3 flex-shrink-0 border"
                style={{ borderColor: border, color }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {validated && q.explanation && (
        <div className="rounded-r-xl px-4 py-3 mb-6 text-[13px] leading-relaxed"
          style={{ background: 'rgba(11,37,69,.04)', borderLeft: '3px solid var(--sf-primary)', color: 'var(--sf-text-2, #374151)' }}>
          💡 {q.explanation}
        </div>
      )}

      {!validated
        ? <button onClick={validate} disabled={selected === null}
            className="btn btn-primary w-full justify-center disabled:opacity-40">
            Valider ma réponse
          </button>
        : <button onClick={next} className="btn btn-primary w-full justify-center">
            {cur + 1 >= questions.length ? 'Voir mon score →' : 'Question suivante →'}
          </button>
      }
    </div>
  )
}

/* ── Quiz Card ───────────────────────────────────────────── */
function QuizCard({ q, onStart, result }) {
  const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.Intermédiaire
  const pct  = result ? Math.round((result.score / result.total) * 100) : null
  return (
    <div className="card card-hover p-5 flex flex-col gap-3" style={result ? { outline: '2px solid #10b981', outlineOffset: '-2px' } : {}}>
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(11,37,69,.07)' }}>{q.icon || '🧠'}</div>
        <div className="flex items-center gap-1.5">
          {result && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ {pct}%</span>}
          <span className="badge text-[10px]" style={{ background: diff.bg, color: diff.color }}>{q.difficulty}</span>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-[14px] mb-1" style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}>{q.title}</h3>
        <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'var(--sf-muted)' }}>{q.description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'var(--sf-border)' }}>
        <span className="text-[11.5px]" style={{ color: 'var(--sf-muted)' }}>🧠 {q.question_count || 20} questions</span>
        <button onClick={() => onStart(q)} className="btn btn-primary btn-sm">{result ? 'Rejouer →' : 'Jouer →'}</button>
      </div>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function QuizSport() {
  const { user } = useAuth()
  const [quizzes,  setQuizzes]  = useState([])
  const [quizErr,  setQuizErr]  = useState(null)
  const [results,  setResults]  = useState([])
  const [active,   setActive]   = useState(null)
  const [loading,  setLoading]  = useState(true)

  function refreshResults() {
    if (user) getUserResults(user.id).then(setResults)
  }

  useEffect(() => {
    getQuizzes().then(({ data, error }) => { setQuizzes(data); setQuizErr(error); setLoading(false) })
    refreshResults()
  }, [user])

  const totalCompleted = results.length
  const bestScore  = results.length ? Math.max(...results.map(r => Math.round((r.score / r.total) * 100))) : 0
  const avgScore   = results.length ? Math.round(results.reduce((a, r) => a + (r.score / r.total) * 100, 0) / results.length) : 0
  const totalXP    = results.reduce((a, r) => a + r.score * 10, 0)

  const resultByQuizId = Object.fromEntries(results.map(r => [r.quiz_id, r]))

  if (active) return (
    <div className="pt-[64px]">
      <section style={{ background: 'var(--sf-primary)' }} className="px-6 lg:px-10 py-8">
        <div className="max-w-[1360px] mx-auto">
          <button onClick={() => { setActive(null); refreshResults() }} className="text-[13px] font-semibold flex items-center gap-1 mb-3 opacity-70 hover:opacity-100 transition-opacity text-white">
            ← Retour aux quiz
          </button>
          <h1 className="font-serif text-2xl font-extrabold text-white mb-1">{active.title}</h1>
          <p className="text-white/55 text-[13px]">{active.question_count || 20} questions · {active.difficulty}</p>
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4">
        <QuizPlayer quiz={active} onFinish={() => setActive(null)} />
      </div>
    </div>
  )

  return (
    <div className="pt-[64px]">

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(155deg, #071a32 0%, var(--sf-primary) 55%, #163b6b 100%)' }} className="px-6 lg:px-10 py-12">
        <div className="max-w-[860px] mx-auto text-center">
          <span className="eyebrow flex justify-center" style={{ color: 'rgba(201,168,76,.8)' }}>Rubrique phare</span>
          <h1 className="font-serif font-extrabold text-white mb-3" style={{ fontSize: 'clamp(26px, 3.5vw, 42px)' }}>
            Quiz <span style={{ color: 'var(--sf-accent)' }}>Sport Business</span>
          </h1>
          <p className="max-w-lg mx-auto text-[14.5px] leading-relaxed mb-7" style={{ color: 'rgba(255,255,255,.65)' }}>
            Plus de 1 000 questions Sport Business et Culture générale du sport — pour s'amuser tout en testant ses connaissances. XP, classements et badges en temps réel.
          </p>
          <div className="flex items-center justify-center flex-wrap gap-0">
            {[
              ['1 000+', 'Questions'],
              [loading ? '…' : `${quizzes.length}`, 'Thèmes'],
              ['#247', 'Votre rang'],
              ['🔥 7', 'Jours streak'],
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

      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-10">

          {/* ── Left ── */}
          <div>
            {/* Dashboard */}
            <div className="card mb-8 overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ background: 'linear-gradient(135deg, var(--sf-primary), var(--sf-primary-light, #163b6b))', color: '#fff' }}>
                <div>
                  <div className="text-[11px] font-bold tracking-wider uppercase opacity-60 mb-1">Votre tableau de bord</div>
                  <div className="font-serif text-2xl font-extrabold text-white">
                    {user ? 'Ma progression' : 'Commencez dès maintenant'}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">{totalXP > 0 ? totalXP.toLocaleString() : '—'}</div>
                    <div className="text-[10.5px] opacity-55">XP total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-extrabold" style={{ color: 'var(--sf-accent)' }}>🔥 —</div>
                    <div className="text-[10.5px] opacity-55">jours streak</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ borderColor: 'var(--sf-border)' }}>
                {[
                  { val: '—',                           label: 'Rang',            sub: 'classement global' },
                  { val: `${totalCompleted || '—'}`,    label: 'Quiz',            sub: 'complétés' },
                  { val: bestScore  ? `${bestScore}%`  : '—', label: 'Meilleur score', sub: 'toutes catégories' },
                  { val: avgScore   ? `${avgScore}%`   : '—', label: 'Taux de réussite', sub: 'moyenne globale' },
                ].map(({ val, label, sub }) => (
                  <div key={label} className="px-5 py-4 text-center">
                    <div className="text-[22px] font-extrabold leading-none mb-1" style={{ fontFamily: 'var(--sf-font-heading)', color: 'var(--sf-primary)' }}>{val}</div>
                    <div className="text-[11.5px] font-semibold" style={{ color: 'var(--sf-text)' }}>{label}</div>
                    <div className="text-[10.5px]" style={{ color: 'var(--sf-muted)' }}>{sub}</div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t text-center" style={{ borderColor: 'var(--sf-border)' }}>
                {user
                  ? <p className="text-[12px]" style={{ color: 'var(--sf-muted)' }}>Jouez pour remplir votre tableau de bord !</p>
                  : <p className="text-[12px]" style={{ color: 'var(--sf-muted)' }}>
                      <a href="/profil" className="font-semibold" style={{ color: 'var(--sf-primary)' }}>Connectez-vous</a>
                      {' '}pour suivre votre progression et apparaître au classement.
                    </p>
                }
              </div>
            </div>

            {/* Badges */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[14px]" style={{ color: 'var(--sf-text)' }}>Badges & Succès</h3>
                <span className="text-[12px]" style={{ color: 'var(--sf-muted)' }}>2/8 débloqués</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {ACHIEVEMENTS.map(a => (
                  <div key={a.id} title={a.desc}
                    className={`card p-3 text-center cursor-help transition-all ${a.unlocked ? '' : 'opacity-35 grayscale'}`}>
                    <div className="text-2xl mb-1">{a.icon}</div>
                    <div className="text-[9.5px] font-semibold leading-tight" style={{ color: 'var(--sf-text)' }}>{a.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[15px]" style={{ color: 'var(--sf-text)' }}>
                  {loading ? 'Chargement…' : quizErr ? 'Quiz' : `Tous les quiz — ${quizzes.length} thème${quizzes.length !== 1 ? 's' : ''}`}
                </h3>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 skeleton rounded-2xl" />)}
                </div>
              ) : quizErr ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">⚠️</div>
                  <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Erreur de chargement</p>
                  <p className="text-[13px] mb-4" style={{ color: '#b91c1c' }}>{quizErr}</p>
                  <button onClick={() => { setLoading(true); setQuizErr(null); getQuizzes().then(({ data, error }) => { setQuizzes(data); setQuizErr(error); setLoading(false) }) }}
                    className="btn btn-outline btn-sm">Réessayer</button>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🧠</div>
                  <p className="font-semibold text-[15px] mb-1" style={{ color: 'var(--sf-text)' }}>Les quiz arrivent bientôt</p>
                  <p className="text-[13px]" style={{ color: 'var(--sf-muted)' }}>Le contenu est en cours de mise en ligne.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map(q => <QuizCard key={q.id} q={q} onStart={setActive} result={resultByQuizId[q.id]} />)}
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="xl:sticky xl:top-[84px] self-start space-y-5">
            <div className="card p-5">
              <div className="text-[11px] font-bold tracking-wide uppercase mb-3" style={{ color: 'var(--sf-muted)' }}>Classement global</div>
              <p className="text-[13px]" style={{ color: 'var(--sf-text)' }}>Jouez pour apparaître au classement !</p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--sf-muted)' }}>Le top des joueurs s'affiche ici une fois que la communauté a joué.</p>
            </div>

            <div className="card p-5">
              <div className="text-[11px] font-bold tracking-wide uppercase mb-3" style={{ color: 'var(--sf-muted)' }}>Prochain défi</div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🚀</div>
                <div>
                  <div className="text-[13px] font-bold" style={{ color: 'var(--sf-text)' }}>Top 100</div>
                  <div className="text-[11.5px]" style={{ color: 'var(--sf-muted)' }}>Complétez vos premiers quiz</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
