import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const EMPTY = { title: '', description: '', level: 'Débutant', duration: '', cover_url: '', is_premium: false, published: false }

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setCourses(data || [])
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setEditing(null); setShowForm(true) }
  function openEdit(c) { setForm(c); setEditing(c.id); setShowForm(true) }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await supabase.from('courses').update(form).eq('id', editing)
    } else {
      await supabase.from('courses').insert(form)
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  async function remove(id) {
    if (!confirm('Supprimer ce cours ?')) return
    await supabase.from('courses').delete().eq('id', id)
    load()
  }

  async function togglePublish(c) {
    await supabase.from('courses').update({ published: !c.published }).eq('id', c.id)
    load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-extrabold text-gray-900">Modules</h1>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouveau module</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier le module' : 'Nouveau module'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
              <input className="form-control" required value={form.title} onChange={set('title')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea className="form-control min-h-[80px]" value={form.description} onChange={set('description')} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Niveau</label>
              <select className="form-control" value={form.level} onChange={set('level')}>
                {['Débutant','Intermédiaire','Avancé','Tous niveaux'].map(l => <option key={l}>{l}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Durée estimée</label>
              <input className="form-control" placeholder="ex: 4h30" value={form.duration} onChange={set('duration')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">URL de couverture</label>
              <input className="form-control" placeholder="https://..." value={form.cover_url} onChange={set('cover_url')} /></div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_premium} onChange={set('is_premium')} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">Premium</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={set('published')} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">Publié</span>
              </label>
            </div>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">{saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer le module'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-5 py-2 text-sm">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['Titre','Niveau','Premium','Statut','Actions'].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs truncate">{c.title}</td>
                <td className="px-5 py-3.5 text-gray-500">{c.level}</td>
                <td className="px-5 py-3.5">{c.is_premium ? <span className="badge-gold">⭐ Oui</span> : <span className="text-gray-400 text-xs">Non</span>}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => togglePublish(c)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.published ? '● Publié' : '○ Brouillon'}
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2 items-center">
                    <button onClick={() => openEdit(c)} className="text-xs text-navy hover:underline font-medium">Modifier</button>
                    <button onClick={() => remove(c.id)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Aucun module. Créez-en un !</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
