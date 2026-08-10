import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const EMPTY = { title: '', excerpt: '', content: '', category: 'Finance', author: '', cover_url: '', read_time: '', published: false, published_at: '' }
const CATS = ['Finance','Droits TV','Sponsoring','Transferts','Gouvernance','Career']

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState(null)

  async function load() {
    const { data } = await supabase.from('articles').select('*').order('id', { ascending: false })
    setArticles(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(a) { setForm(a); setEditing(a.id); setShowForm(true); setSaveErr(null) }

  async function save(e) {
    e.preventDefault(); setSaving(true); setSaveErr(null)
    const payload = { ...form, published_at: form.published_at || null }
    if (payload.published && !payload.published_at) payload.published_at = new Date().toISOString()
    const { error } = editing
      ? await supabase.from('articles').update(payload).eq('id', editing)
      : await supabase.from('articles').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer cet article ?')) return
    await supabase.from('articles').delete().eq('id', id); load()
  }

  async function togglePublish(a) {
    const patch = { published: !a.published }
    if (patch.published && !a.published_at) patch.published_at = new Date().toISOString()
    await supabase.from('articles').update(patch).eq('id', a.id); load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Articles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvel article</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier l\'article' : 'Nouvel article'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
              <input className="form-control" required value={form.title} onChange={set('title')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Résumé</label>
              <textarea className="form-control" value={form.excerpt} onChange={set('excerpt')} /></div>
            <div className="md:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Contenu</label>
              <textarea className="form-control min-h-[200px]" value={form.content} onChange={set('content')} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
              <select className="form-control" value={form.category} onChange={set('category')}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Auteur</label>
              <input className="form-control" value={form.author} onChange={set('author')} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Temps de lecture (min)</label>
              <input className="form-control" placeholder="ex: 5" value={form.read_time} onChange={set('read_time')} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">URL image de couverture</label>
              <input className="form-control" placeholder="https://..." value={form.cover_url} onChange={set('cover_url')} /></div>
            <div><label className="flex items-center gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={form.published} onChange={set('published')} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-gray-700">Publier maintenant</span>
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
            <tr>{['Titre','Catégorie','Auteur','Date','Statut','Actions'].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs truncate">{a.title}</td>
                <td className="px-5 py-3.5 text-gray-500">{a.category}</td>
                <td className="px-5 py-3.5 text-gray-500">{a.author || '—'}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{a.published_at ? new Date(a.published_at).toLocaleDateString('fr-FR') : '—'}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => togglePublish(a)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.published ? '● Publié' : '○ Brouillon'}
                  </button>
                </td>
                <td className="px-5 py-3.5"><div className="flex gap-2 items-center">
                  {a.published && <Link to={`/articles/${a.id}`} target="_blank" className="text-xs text-gray-400 hover:text-gray-700 font-medium">👁</Link>}
                  <button onClick={() => openEdit(a)} className="text-xs text-navy hover:underline font-medium">Modifier</button>
                  <button onClick={() => remove(a.id)} className="text-xs text-red-500 hover:underline font-medium">Supprimer</button>
                </div></td>
              </tr>
            ))}
            {articles.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Aucun article.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
