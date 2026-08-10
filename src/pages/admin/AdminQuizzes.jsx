import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { title: '', description: '', category: '', difficulty: 'Débutant', question_count: 0, icon: '🧠', theme: '', published: false }

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState(null)

  async function load() {
    const { data } = await supabase.from('quizzes').select('*').order('id', { ascending: false })
    setQuizzes(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(q) { setForm(q); setEditing(q.id); setShowForm(true); setSaveErr(null) }

  async function save(e) {
    e.preventDefault(); setSaving(true); setSaveErr(null)
    const { error } = editing
      ? await supabase.from('quizzes').update(form).eq('id', editing)
      : await supabase.from('quizzes').insert(form)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer ce quiz ?')) return
    await supabase.from('quizzes').delete().eq('id', id); load()
  }

  async function togglePublish(q) {
    await supabase.from('quizzes').update({ published: !q.published }).eq('id', q.id); load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-extrabold text-gray-900">Quiz</h1>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouveau quiz</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier le quiz' : 'Nouveau quiz'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
              <input className="form-control" required value={form.title} onChange={set('title')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea className="form-control" value={form.description} onChange={set('description')} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
              <input className="form-control" placeholder="ex: Droits TV" value={form.category} onChange={set('category')} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Icône (emoji)</label>
              <input className="form-control" placeholder="ex: 🏟️" value={form.icon} onChange={set('icon')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Thème (couleur / style)</label>
              <input className="form-control" placeholder="ex: blue, gold, emerald…" value={form.theme} onChange={set('theme')} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Difficulté</label>
              <select className="form-control" value={form.difficulty} onChange={set('difficulty')}>
                {['Débutant','Intermédiaire','Avancé'].map(d => <option key={d}>{d}</option>)}
              </select></div>
            <div><label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={form.published} onChange={set('published')} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-gray-700">Publié</span>
            </label></div>
            {saveErr && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>}
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-5 py-2 text-sm">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['Titre','Catégorie','Difficulté','Statut','Actions'].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quizzes.map(q => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs truncate">{q.title}</td>
                <td className="px-5 py-3.5 text-gray-500">{q.category || '—'}</td>
                <td className="px-5 py-3.5 text-gray-500">{q.difficulty}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => togglePublish(q)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${q.published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {q.published ? '● Publié' : '○ Brouillon'}
                  </button>
                </td>
                <td className="px-5 py-3.5"><div className="flex gap-2">
                  <button onClick={() => openEdit(q)} className="text-xs text-navy hover:underline font-medium">Modifier</button>
                  <button onClick={() => remove(q.id)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                </div></td>
              </tr>
            ))}
            {quizzes.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Aucun quiz.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
