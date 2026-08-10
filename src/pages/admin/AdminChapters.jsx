import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

async function moveChapter(item, dir, items, load) {
  const idx = items.findIndex(i => i.id === item.id)
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return
  const reordered = [...items]
  ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
  await Promise.all(reordered.map((it, pos) => supabase.from('chapters').update({ position: pos }).eq('id', it.id)))
  load()
}

const EMPTY = { course_id: '', title: '', content: '', duration: '', type: 'lecture', position: 1, is_premium: false, pdf_url: '' }

export default function AdminChapters() {
  const [chapters, setChapters] = useState([])
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState(null)
  const [filterCourse, setFilterCourse] = useState('')

  async function load() {
    const [{ data: ch }, { data: co }] = await Promise.all([
      supabase.from('chapters').select('*, courses(title)').order('position'),
      supabase.from('courses').select('id,title').order('title'),
    ])
    setChapters(ch || [])
    setCourses(co || [])
    if (!filterCourse && co?.length) setFilterCourse(co[0].id)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm({ ...EMPTY, course_id: filterCourse }); setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(c) {
    // Strip the joined 'courses' object — it's not a DB column
    const { courses: _joined, ...fields } = c
    setForm(fields); setEditing(c.id); setShowForm(true); setSaveErr(null)
  }

  async function save(e) {
    e.preventDefault(); setSaving(true); setSaveErr(null)
    // Only send known columns, never the joined relation object
    const { courses: _joined, ...payload } = form
    const { error } = editing
      ? await supabase.from('chapters').update(payload).eq('id', editing)
      : await supabase.from('chapters').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer ce chapitre ?')) return
    await supabase.from('chapters').delete().eq('id', id); load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const filtered = filterCourse ? chapters.filter(c => c.course_id === filterCourse) : chapters

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Cours</h1>
          <p className="text-sm text-gray-500 mt-0.5">{chapters.length} cours</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouveau cours</button>
      </div>

      <div className="mb-4">
        <select className="form-control max-w-xs" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">Tous les modules</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier le cours' : 'Nouveau cours'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Module *</label>
              <select className="form-control" required value={form.course_id} onChange={set('course_id')}>
                <option value="">Choisir un module</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
              <input type="number" className="form-control" value={form.position} onChange={set('position')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
              <input className="form-control" required value={form.title} onChange={set('title')} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
              <select className="form-control" value={form.type} onChange={set('type')}>
                {['lecture','video','pdf','exercise','quiz'].map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Durée</label>
              <input className="form-control" placeholder="ex: 15 min" value={form.duration} onChange={set('duration')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">URL du PDF</label>
              <input className="form-control" placeholder="https://... (lien vers le fichier PDF)" value={form.pdf_url} onChange={set('pdf_url')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Contenu (texte)</label>
              <textarea className="form-control min-h-[100px]" value={form.content} onChange={set('content')} /></div>
            <div><label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_premium} onChange={set('is_premium')} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-gray-700">Premium uniquement</span>
            </label></div>
            {saveErr && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>}
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">{saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer le cours'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-5 py-2 text-sm">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['#','Titre','Module','Type','Durée','Premium','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((ch, i) => (
              <tr key={ch.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <button onClick={() => moveChapter(ch, 'up', filtered, load)} disabled={i === 0}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↑</button>
                    <span className="text-xs text-gray-400 font-mono">{ch.position}</span>
                    <button onClick={() => moveChapter(ch, 'down', filtered, load)} disabled={i === filtered.length - 1}
                      className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↓</button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{ch.title}</td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[150px] truncate">{ch.courses?.title}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{ch.type}</td>
                <td className="px-4 py-3 text-gray-500">{ch.duration || '—'}</td>
                <td className="px-4 py-3">{ch.is_premium ? <span className="badge-gold text-xs">Oui</span> : <span className="text-gray-300 text-xs">Non</span>}</td>
                <td className="px-4 py-3"><div className="flex gap-2">
                  <button onClick={() => openEdit(ch)} className="text-xs text-navy hover:underline font-medium">Modifier</button>
                  <button onClick={() => remove(ch.id)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                </div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Aucun cours dans ce module.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
