import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { quiz_id: '', question: '', options: ['','','',''], correct_index: 0, explanation: '', position: 1 }

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterQuiz, setFilterQuiz] = useState('')

  async function load() {
    const [{ data: q }, { data: qz }] = await Promise.all([
      supabase.from('quiz_questions').select('*, quizzes(title)').order('position'),
      supabase.from('quizzes').select('id,title').order('title'),
    ])
    setQuestions(q || [])
    setQuizzes(qz || [])
    if (!filterQuiz && qz?.length) setFilterQuiz(qz[0].id)
  }
  useEffect(() => { load() }, [])

  function openNew() { setForm({ ...EMPTY, quiz_id: filterQuiz }); setEditing(null); setShowForm(true) }
  function openEdit(q) { setForm({ ...q, options: Array.isArray(q.options) ? q.options : ['','','',''] }); setEditing(q.id); setShowForm(true) }

  async function save(e) {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, correct_index: Number(form.correct_index), position: Number(form.position) }
    editing
      ? await supabase.from('quiz_questions').update(payload).eq('id', editing)
      : await supabase.from('quiz_questions').insert(payload)
    setSaving(false); setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer cette question ?')) return
    await supabase.from('quiz_questions').delete().eq('id', id); load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setOpt = i => e => setForm(f => { const opts = [...f.options]; opts[i] = e.target.value; return { ...f, options: opts } })
  const filtered = filterQuiz ? questions.filter(q => q.quiz_id === filterQuiz) : questions

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-extrabold text-gray-900">Questions de quiz</h1>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvelle question</button>
      </div>

      <div className="mb-4">
        <select className="form-control max-w-xs" value={filterQuiz} onChange={e => setFilterQuiz(e.target.value)}>
          <option value="">Tous les quiz</option>
          {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier la question' : 'Nouvelle question'}</h2>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Quiz *</label>
                <select className="form-control" required value={form.quiz_id} onChange={set('quiz_id')}>
                  <option value="">Choisir un quiz</option>
                  {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                </select></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
                <input type="number" className="form-control" value={form.position} onChange={set('position')} /></div>
            </div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Question *</label>
              <textarea className="form-control min-h-[80px]" required value={form.question} onChange={set('question')} /></div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Options (4 réponses) *</label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <input type="radio" name="correct" checked={Number(form.correct_index) === i} onChange={() => setForm(f => ({ ...f, correct_index: i }))} className="w-4 h-4 accent-navy" />
                  <input className="form-control flex-1" placeholder={`Option ${i + 1}`} value={opt} onChange={setOpt(i)} required />
                  {Number(form.correct_index) === i && <span className="text-xs text-emerald-600 font-bold flex-shrink-0">✓ Correcte</span>}
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-1">Sélectionnez le bouton radio à côté de la bonne réponse.</p>
            </div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Explication (optionnelle)</label>
              <textarea className="form-control" value={form.explanation} onChange={set('explanation')} placeholder="Affiché après validation de la réponse…" /></div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-5 py-2 text-sm">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['#','Question','Quiz','Bonne réponse','Actions'].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(q => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-400 font-medium">{q.position}</td>
                <td className="px-5 py-3 font-medium text-gray-900 max-w-xs truncate">{q.question}</td>
                <td className="px-5 py-3 text-gray-500 text-xs max-w-[150px] truncate">{q.quizzes?.title}</td>
                <td className="px-5 py-3 text-emerald-600 text-xs font-medium max-w-[150px] truncate">{q.options?.[q.correct_index] || '—'}</td>
                <td className="px-5 py-3"><div className="flex gap-2">
                  <button onClick={() => openEdit(q)} className="text-xs text-navy hover:underline font-medium">Modifier</button>
                  <button onClick={() => remove(q.id)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                </div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Aucune question.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
