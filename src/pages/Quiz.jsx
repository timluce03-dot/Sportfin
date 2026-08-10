import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function QuizPlayer({ quiz, onFinish }) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [validated, setValidated] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('quiz_questions').select('*').eq('quiz_id', quiz.id).order('position')
      .then(({ data }) => { setQuestions(data || []); setLoading(false) })
  }, [quiz.id])

  function validate() {
    if (selected === null) return
    setValidated(true)
    if (selected === questions[current].correct_index) setScore(s => s + 1)
  }

  function next() {
    if (current + 1 >= questions.length) {
      setDone(true)
      if (user) {
        supabase.from('quiz_results').insert({ user_id: user.id, quiz_id: quiz.id, score, total: questions.length })
      }
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setValidated(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-navy border-t-transparent rounded-full" /></div>

  if (done) return (
    <div className="text-center py-16 max-w-lg mx-auto">
      <div className="text-7xl font-extrabold text-navy mb-2">{score}/{questions.length}</div>
      <div className="text-gray-500 text-lg mb-2">Score final</div>
      <div className={`text-sm font-semibold mb-8 ${score / questions.length >= 0.7 ? 'text-emerald-600' : 'text-amber-600'}`}>
        {score / questions.length >= 0.7 ? '🎉 Excellent résultat !' : '💪 Continuez à vous entraîner !'}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={onFinish} className="btn-ghost">← Retour</button>
        <button onClick={() => { setCurrent(0); setSelected(null); setValidated(false); setScore(0); setDone(false) }} className="btn-primary">Rejouer</button>
      </div>
    </div>
  )

  const q = questions[current]
  const opts = q?.options || []

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-sm text-gray-500 font-medium">Question {current + 1}/{questions.length}</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-navy rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-navy">{score} pts</span>
      </div>

      <h2 className="font-serif text-2xl font-bold text-gray-900 mb-8 leading-snug">{q?.question}</h2>

      <div className="flex flex-col gap-3 mb-8">
        {opts.map((opt, i) => {
          let cls = 'px-5 py-4 rounded-xl border-2 font-medium text-left text-sm transition-all cursor-pointer '
          if (!validated) cls += selected === i ? 'border-navy bg-blue-50 text-navy font-semibold' : 'border-gray-200 bg-white hover:border-navy'
          else if (i === q.correct_index) cls += 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
          else if (i === selected) cls += 'border-red-400 bg-red-50 text-red-600'
          else cls += 'border-gray-200 bg-white text-gray-400'
          return <button key={i} className={cls} onClick={() => !validated && setSelected(i)}>{opt}</button>
        })}
      </div>

      {validated && q?.explanation && (
        <div className="bg-gray-50 border-l-4 border-navy rounded-r-xl px-5 py-4 mb-6 text-sm text-gray-700 leading-relaxed">
          💡 {q.explanation}
        </div>
      )}

      {!validated
        ? <button onClick={validate} disabled={selected === null} className="btn-primary w-full justify-center py-3 disabled:opacity-50">Valider</button>
        : <button onClick={next} className="btn-primary w-full justify-center py-3">{current + 1 >= questions.length ? 'Voir les résultats' : 'Question suivante →'}</button>
      }
    </div>
  )
}

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  useEffect(() => {
    supabase.from('quizzes').select('id,title,description,category,question_count,difficulty').eq('published', true)
      .then(({ data }) => { setQuizzes(data || []); setLoading(false) })
  }, [])

  const DIFF_COLOR = { Débutant: 'text-emerald-600 bg-emerald-50', Intermédiaire: 'text-amber-600 bg-amber-50', Avancé: 'text-red-600 bg-red-50' }

  if (active) return (
    <div className="pt-[68px] max-w-3xl mx-auto px-6 py-6">
      <button onClick={() => setActive(null)} className="text-sm text-navy font-semibold mb-4 hover:underline">← Retour aux quiz</button>
      <h1 className="font-serif text-2xl font-extrabold mb-1">{active.title}</h1>
      <p className="text-gray-500 text-sm mb-6">{active.description}</p>
      <QuizPlayer quiz={active} onFinish={() => setActive(null)} />
    </div>
  )

  return (
    <div className="pt-[68px]">
      <div className="text-white py-12 px-6 lg:px-10" style={{ background: 'linear-gradient(135deg, #072d6e, #0B3D91)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl font-extrabold mb-3">Quiz Sport Business</h1>
          <p className="text-white/80 max-w-2xl">Testez et renforcez vos connaissances avec nos quiz thématiques.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Aucun quiz disponible pour l'instant.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {quizzes.map(q => (
              <button key={q.id} onClick={() => setActive(q)}
                className="bg-white rounded-2xl p-5 text-left shadow-md border-2 border-transparent hover:border-navy hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="text-3xl mb-3">🧠</div>
                <h4 className="font-bold text-gray-900 mb-1 leading-snug">{q.title}</h4>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{q.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {q.difficulty && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_COLOR[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>{q.difficulty}</span>}
                  {q.question_count && <span className="text-xs text-gray-400">{q.question_count} questions</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
