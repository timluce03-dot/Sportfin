import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const DIFFICULTIES = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
const EX_EMPTY = { chapter_id: '', title: '', description: '', difficulty: 'Intermédiaire', published: true }
const Q_EMPTY = {
  question: '', question_type: 'qcm',
  opt_a: '', opt_b: '', opt_c: '', opt_d: '',
  is_multi: false, correct_index: 0, correct_indexes: [],
  accepted_answers: [], explanation: ''
}
const LETTERS = ['A', 'B', 'C', 'D']

function parseCorrectIndexes(q) {
  if (!q.is_multi) return []
  if (Array.isArray(q.correct_indexes)) return q.correct_indexes
  try { return JSON.parse(q.correct_indexes || '[]') } catch { return [] }
}

function qToForm(q) {
  const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
  let aa = []
  if (q.accepted_answers) {
    aa = Array.isArray(q.accepted_answers) ? q.accepted_answers : JSON.parse(q.accepted_answers)
  }
  return {
    question: q.question, question_type: q.question_type || 'qcm',
    opt_a: opts[0] || '', opt_b: opts[1] || '',
    opt_c: opts[2] || '', opt_d: opts[3] || '',
    is_multi: q.is_multi || false,
    correct_index: q.correct_index ?? 0,
    correct_indexes: parseCorrectIndexes(q),
    accepted_answers: aa,
    explanation: q.explanation || ''
  }
}

function formToPayload(f, exerciseId, position) {
  if (f.question_type === 'open') {
    return {
      exercise_id: exerciseId, question: f.question,
      question_type: 'open',
      accepted_answers: JSON.stringify(f.accepted_answers.filter(Boolean)),
      options: null, is_multi: false, correct_index: null, correct_indexes: null,
      explanation: f.explanation, position
    }
  }
  return {
    exercise_id: exerciseId, question: f.question,
    question_type: 'qcm',
    options: JSON.stringify([f.opt_a, f.opt_b, f.opt_c, f.opt_d]),
    is_multi: f.is_multi,
    correct_index: f.is_multi ? (f.correct_indexes[0] ?? 0) : Number(f.correct_index),
    correct_indexes: f.is_multi ? JSON.stringify(f.correct_indexes) : null,
    accepted_answers: null,
    explanation: f.explanation, position
  }
}

export default function AdminExercises() {
  const [view,      setView]      = useState('list')
  const [activeEx,  setActiveEx]  = useState(null)

  /* ── Exercise state ── */
  const [exercises, setExercises] = useState([])
  const [chapters,  setChapters]  = useState([])
  const [exForm,    setExForm]    = useState(EX_EMPTY)
  const [editingEx, setEditingEx] = useState(null)
  const [showExForm,setShowExForm]= useState(false)
  const [savingEx,  setSavingEx]  = useState(false)
  const [exErr,     setExErr]     = useState(null)

  /* ── Question state ── */
  const [questions, setQuestions] = useState([])
  const [qForm,     setQForm]     = useState(Q_EMPTY)
  const [editingQ,  setEditingQ]  = useState(null)
  const [showQForm, setShowQForm] = useState(false)
  const [savingQ,   setSavingQ]   = useState(false)
  const [qErr,      setQErr]      = useState(null)

  /* ── Load ── */
  async function loadExercises() {
    const [{ data: ex }, { data: ch }] = await Promise.all([
      supabase.from('exercises').select('*, chapters(title), exercise_questions(id)').order('position'),
      supabase.from('chapters').select('id, title, courses(title)').order('title'),
    ])
    setExercises(ex || [])
    setChapters(ch || [])
  }

  async function loadQuestions(exerciseId) {
    const { data } = await supabase.from('exercise_questions')
      .select('*').eq('exercise_id', exerciseId).order('position')
    setQuestions(data || [])
  }

  useEffect(() => { loadExercises() }, [])

  /* ── Exercise CRUD ── */
  function openNewEx()    { setExForm(EX_EMPTY); setEditingEx(null); setShowExForm(true); setExErr(null) }
  function openEditEx(ex) { const { chapters: _, ...f } = ex; setExForm(f); setEditingEx(ex.id); setShowExForm(true); setExErr(null) }

  async function saveEx(e) {
    e.preventDefault(); setSavingEx(true); setExErr(null)
    const { chapters: _, ...payload } = exForm
    const { error } = editingEx
      ? await supabase.from('exercises').update(payload).eq('id', editingEx)
      : await supabase.from('exercises').insert(payload)
    setSavingEx(false)
    if (error) { setExErr(error.message); return }
    setShowExForm(false); loadExercises()
  }

  async function removeEx(id) {
    if (!confirm('Supprimer cet exercice et toutes ses questions ?')) return
    await supabase.from('exercises').delete().eq('id', id); loadExercises()
  }

  async function togglePublish(ex) {
    await supabase.from('exercises').update({ published: !ex.published }).eq('id', ex.id); loadExercises()
  }

  /* ── Open question manager ── */
  function manageQuestions(ex) {
    setActiveEx(ex); setView('questions'); loadQuestions(ex.id)
    setShowQForm(false); setQForm(Q_EMPTY); setEditingQ(null)
  }

  /* ── Question CRUD ── */
  function openNewQ()    { setQForm(Q_EMPTY); setEditingQ(null); setShowQForm(true); setQErr(null) }
  function openEditQ(q)  { setQForm(qToForm(q)); setEditingQ(q.id); setShowQForm(true); setQErr(null) }

  async function saveQ(e) {
    e.preventDefault(); setSavingQ(true); setQErr(null)
    const payload = formToPayload(qForm, activeEx.id, editingQ ? undefined : questions.length)
    const { error } = editingQ
      ? await supabase.from('exercise_questions').update(payload).eq('id', editingQ)
      : await supabase.from('exercise_questions').insert(payload)
    setSavingQ(false)
    if (error) { setQErr(error.message); return }
    setShowQForm(false); setQForm(Q_EMPTY); setEditingQ(null); loadQuestions(activeEx.id)
  }

  async function removeQ(id) {
    if (!confirm('Supprimer cette question ?')) return
    await supabase.from('exercise_questions').delete().eq('id', id); loadQuestions(activeEx.id)
  }

  const setEx = k => e => setExForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const setQ  = k => e => setQForm(f => ({ ...f, [k]: e.target.value }))

  /* ══════════════════════ QUESTION VIEW ══════════════════════ */
  if (view === 'questions' && activeEx) return (
    <div>
      <button onClick={() => { setView('list'); loadExercises() }}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 mb-5">
        ← Retour aux exercices
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">{activeEx.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{questions.length} question{questions.length !== 1 ? 's' : ''} · QCM</p>
        </div>
        <button onClick={openNewQ} className="btn-primary text-sm px-4 py-2">+ Ajouter une question</button>
      </div>

      {/* Question form */}
      {showQForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editingQ ? 'Modifier la question' : 'Nouvelle question'}</h2>
          <form onSubmit={saveQ} className="space-y-4">
            {/* Type de question */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-xs font-semibold text-gray-600 flex-shrink-0">Type de question :</span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { type: 'qcm',  label: '☑️ QCM' },
                  { type: 'open', label: '✏️ Question ouverte' },
                ].map(({ type, label }) => (
                  <label key={type} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                    qForm.question_type === type
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                  }`}>
                    <input type="radio" name="question_type" checked={qForm.question_type === type}
                      onChange={() => setQForm(f => ({ ...f, question_type: type }))}
                      className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Question *</label>
              <textarea className="form-control" required rows={3} value={qForm.question} onChange={setQ('question')}
                placeholder={qForm.question_type === 'open'
                  ? 'ex: Quel est le nom du trophée remis au meilleur joueur du monde ?'
                  : 'ex: Quel est le principal mode de financement des clubs de football professionnels en France ?'} />
            </div>

            {qForm.question_type === 'qcm' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['opt_a','opt_b','opt_c','opt_d'].map((key, i) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Option {LETTERS[i]} *</label>
                      <input className="form-control" required value={qForm[key]} onChange={setQ(key)}
                        placeholder={`Option ${LETTERS[i]}`} />
                    </div>
                  ))}
                </div>

                {/* Type réponse QCM */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-xs font-semibold text-gray-600 flex-shrink-0">Sélection :</span>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { multi: false, label: '⚪ Une seule réponse' },
                      { multi: true,  label: '☑️ Plusieurs réponses' },
                    ].map(({ multi, label }) => (
                      <label key={String(multi)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-semibold transition-all ${
                        qForm.is_multi === multi
                          ? multi ? 'bg-purple-50 border-purple-400 text-purple-700' : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                        <input type="radio" name="qtype" checked={qForm.is_multi === multi}
                          onChange={() => setQForm(f => ({ ...f, is_multi: multi, correct_index: 0, correct_indexes: [] }))}
                          className="sr-only" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bonne(s) réponse(s) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Bonne{qForm.is_multi ? 's' : ''} réponse{qForm.is_multi ? 's' : ''} *
                    {qForm.is_multi && <span className="text-gray-400 font-normal ml-1">(cochez toutes les bonnes)</span>}
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {LETTERS.map((l, i) => {
                      const selected = qForm.is_multi
                        ? qForm.correct_indexes.includes(i)
                        : Number(qForm.correct_index) === i
                      return (
                        <label key={l} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border cursor-pointer text-sm font-semibold transition-all ${
                          selected
                            ? qForm.is_multi ? 'bg-purple-50 border-purple-400 text-purple-700' : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                          {qForm.is_multi ? (
                            <input type="checkbox" checked={selected}
                              onChange={() => setQForm(f => ({
                                ...f,
                                correct_indexes: selected
                                  ? f.correct_indexes.filter(x => x !== i)
                                  : [...f.correct_indexes, i]
                              }))} className="sr-only" />
                          ) : (
                            <input type="radio" name="correct" value={i} checked={selected}
                              onChange={() => setQForm(f => ({ ...f, correct_index: i }))} className="sr-only" />
                          )}
                          {l}
                        </label>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Open question — accepted answers */
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-600">
                    Réponses acceptées *
                    <span className="font-normal text-gray-400 ml-1">(toutes les formes correctes, avec tolérance orthographique automatique)</span>
                  </label>
                  <button type="button"
                    onClick={() => setQForm(f => ({ ...f, accepted_answers: [...f.accepted_answers, ''] }))}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    + Ajouter une forme
                  </button>
                </div>
                <div className="space-y-2">
                  {qForm.accepted_answers.length === 0 && (
                    <button type="button"
                      onClick={() => setQForm(f => ({ ...f, accepted_answers: [''] }))}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-xs font-semibold text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                      + Ajouter la première réponse acceptée
                    </button>
                  )}
                  {qForm.accepted_answers.map((ans, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="form-control flex-1"
                        value={ans}
                        onChange={e => setQForm(f => {
                          const aa = [...f.accepted_answers]
                          aa[idx] = e.target.value
                          return { ...f, accepted_answers: aa }
                        })}
                        placeholder={idx === 0 ? 'ex: Ballon d\'Or' : `Variante ${idx + 1} (ex: ballon d'or, Ballon d or…)`}
                      />
                      {qForm.accepted_answers.length > 1 && (
                        <button type="button"
                          onClick={() => setQForm(f => ({ ...f, accepted_answers: f.accepted_answers.filter((_, j) => j !== idx) }))}
                          className="text-red-400 hover:text-red-600 font-bold text-lg w-6 flex-shrink-0">×</button>
                      )}
                    </div>
                  ))}
                  {qForm.accepted_answers.length > 0 && (
                    <p className="text-[11px] text-indigo-600 font-medium px-1">
                      💡 Les fautes d'orthographe légères seront automatiquement acceptées (ex : "Balon d'Or" → accepté)
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Explication (affichée après correction)</label>
              <textarea className="form-control" rows={3} value={qForm.explanation} onChange={setQ('explanation')}
                placeholder="ex: Les droits TV représentent en moyenne 40% des revenus des clubs de Ligue 1…" />
            </div>

            {qErr && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{qErr}</div>}
            <div className="flex gap-3">
              <button type="submit" disabled={savingQ} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">
                {savingQ ? 'Enregistrement…' : editingQ ? 'Mettre à jour' : 'Ajouter la question'}
              </button>
              <button type="button" onClick={() => { setShowQForm(false); setEditingQ(null) }} className="btn-ghost px-5 py-2 text-sm">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {questions.length === 0 && !showQForm && (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">❓</div>
            <p className="font-medium">Aucune question — cliquez sur « Ajouter une question »</p>
          </div>
        )}
        {questions.map((q, idx) => {
          const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')
          const correctIdxs = q.is_multi ? parseCorrectIndexes(q) : [q.correct_index]
          return (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{idx + 1}</span>
                  <div className="min-w-0">
                    {q.is_multi && (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 mb-1">
                        ☑️ Plusieurs bonnes réponses
                      </span>
                    )}
                    <p className="text-[14px] font-semibold text-gray-900 leading-snug">{q.question}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEditQ(q)} className="text-xs text-blue-600 hover:underline font-medium">Modifier</button>
                  <button onClick={() => removeQ(q.id)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {opts.map((opt, i) => {
                  const isCorrect = correctIdxs.includes(i)
                  return (
                    <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                      isCorrect
                        ? q.is_multi ? 'bg-purple-50 border border-purple-300 text-purple-700 font-semibold' : 'bg-emerald-50 border border-emerald-300 text-emerald-700 font-semibold'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      <span className="font-bold">{LETTERS[i]}.</span> {opt}
                      {isCorrect && <span className="ml-auto">✓</span>}
                    </div>
                  )
                })}
              </div>
              {q.explanation && (
                <p className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3">{q.explanation}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  /* ══════════════════════ EXERCISE LIST VIEW ══════════════════════ */
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Exercices</h1>
          <p className="text-sm text-gray-500 mt-0.5">{exercises.length} exercice{exercises.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNewEx} className="btn-primary text-sm px-4 py-2">+ Nouvel exercice</button>
      </div>

      {/* Exercise form */}
      {showExForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editingEx ? "Modifier l'exercice" : 'Nouvel exercice'}</h2>
          <form onSubmit={saveEx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
              <input className="form-control" required value={exForm.title} onChange={setEx('title')}
                placeholder="ex: Exercice — Analyse financière d'un club" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea className="form-control" rows={2} value={exForm.description} onChange={setEx('description')}
                placeholder="Courte description de l'exercice…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cours associé</label>
              <select className="form-control" value={exForm.chapter_id} onChange={setEx('chapter_id')}>
                <option value="">— Aucun cours —</option>
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}{ch.courses?.title ? ` — ${ch.courses.title}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Difficulté</label>
              <select className="form-control" value={exForm.difficulty} onChange={setEx('difficulty')}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub-ex" checked={exForm.published} onChange={setEx('published')} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="pub-ex" className="text-sm text-gray-700 font-medium">Publier</label>
            </div>
            {exErr && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{exErr}</div>}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={savingEx} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {savingEx ? 'Enregistrement…' : editingEx ? 'Mettre à jour' : "Créer l'exercice"}
              </button>
              <button type="button" onClick={() => setShowExForm(false)} className="btn-outline text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* How-to hint */}
      {exercises.length > 0 && (
        <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-[12.5px] text-indigo-800">
          <span className="text-lg flex-shrink-0">💡</span>
          <span><strong>Étape 2 :</strong> Après avoir créé un exercice, cliquez sur le bouton <strong>"Ajouter des questions"</strong> (ou le compteur de questions) sur sa ligne pour ajouter vos QCM — question, 4 options, bonne réponse, explication.</span>
        </div>
      )}

      {/* Exercises table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {exercises.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">✏️</div>
            <p className="font-medium">Aucun exercice — cliquez sur « Nouvel exercice »</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Titre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Cours lié</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Difficulté</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Questions QCM</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, i) => {
                const qCount = ex.exercise_questions?.length ?? 0
                return (
                <tr key={ex.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === exercises.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[240px]">
                    <div className="truncate">{ex.title}</div>
                    {ex.description && <div className="text-xs text-gray-400 truncate mt-0.5">{ex.description}</div>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs hidden md:table-cell max-w-[160px] truncate">
                    {ex.chapters?.title || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{ex.difficulty}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button onClick={() => togglePublish(ex)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${ex.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {ex.published ? 'Publié' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button onClick={() => manageQuestions(ex)}
                      className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        qCount === 0
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}>
                      {qCount === 0 ? '⚠️ Ajouter des questions' : `✏️ ${qCount} question${qCount > 1 ? 's' : ''}`}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-3">
                    <button onClick={() => openEditEx(ex)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Éditer</button>
                    <button onClick={() => removeEx(ex.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Suppr.</button>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
