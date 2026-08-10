import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Finance & Gestion', 'Droits TV & Médias', 'Stratégie & Conseil', 'Marketing & Sponsoring', 'Gouvernance', 'Propriété & Investissement']
const EMPTY = { title: '', guest: '', duration: '', category: '', description: '', thumbnail: '', youtube_id: '', published: true, published_at: null }

export default function AdminPodcasts() {
  const [podcasts, setPodcasts] = useState([])
  const [form,     setForm]     = useState(EMPTY)
  const [editing,  setEditing]  = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saveErr,  setSaveErr]  = useState(null)

  async function load() {
    const { data } = await supabase.from('podcasts').select('*').order('id', { ascending: false })
    setPodcasts(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew()   { setForm(EMPTY);  setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(p) { setForm(p);      setEditing(p.id); setShowForm(true); setSaveErr(null) }

  async function save(ev) {
    ev.preventDefault(); setSaving(true); setSaveErr(null)
    const payload = { ...form, published_at: form.published_at || null }
    const { error } = editing
      ? await supabase.from('podcasts').update(payload).eq('id', editing)
      : await supabase.from('podcasts').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer cet épisode ?')) return
    await supabase.from('podcasts').delete().eq('id', id); load()
  }

  async function togglePublish(p) {
    await supabase.from('podcasts').update({ published: !p.published }).eq('id', p.id); load()
  }

  const set = k => ev => setForm(f => ({ ...f, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Podcasts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{podcasts.length} épisode{podcasts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvel épisode</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier l\'épisode' : 'Nouvel épisode'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
              <input className="form-control" required value={form.title} onChange={set('title')} placeholder="ex: Finance des clubs : ce que personne ne vous dit" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Invité</label>
              <input className="form-control" value={form.guest} onChange={set('guest')} placeholder="ex: Jean Dupont, DG Ligue 1" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Durée</label>
              <input className="form-control" value={form.duration} onChange={set('duration')} placeholder="ex: 48 min" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
              <select className="form-control" value={form.category} onChange={set('category')}>
                <option value="">— Choisir —</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date de publication</label>
              <input type="date" className="form-control" value={form.published_at} onChange={set('published_at')} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={set('description')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL thumbnail</label>
              <input className="form-control" value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">YouTube ID</label>
              <input className="form-control" value={form.youtube_id} onChange={set('youtube_id')} placeholder="ex: dQw4w9WgXcQ" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub-pod" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="pub-pod" className="text-sm text-gray-700 font-medium">Publier</label>
            </div>
            {saveErr && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {podcasts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🎙️</div>
            <p className="font-medium">Aucun épisode — cliquez sur « Nouvel épisode »</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Titre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Invité</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Durée</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {podcasts.map((p, i) => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === podcasts.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-[240px]">
                    <div className="truncate">{p.title}</div>
                    {p.published_at && <div className="text-xs text-gray-400 mt-0.5">{new Date(p.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.guest || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {p.category && <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{p.category}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell font-mono">{p.duration || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(p)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${p.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {p.published ? 'Publié' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {p.published && <a href={`/podcasts/${p.id}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 font-medium mr-3 text-[12px]">👁</a>}
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Éditer</button>
                    <button onClick={() => remove(p.id)} className="text-red-500 hover:text-red-700 font-medium">Suppr.</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
