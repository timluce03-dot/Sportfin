import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { title: '', description: '', photo_url: '', position: 0, published: true }

export default function AdminCareerMetiers() {
  const [metiers,   setMetiers]   = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [editing,   setEditing]   = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState(null)

  async function load() {
    const { data } = await supabase.from('career_metiers').select('*').order('position')
    setMetiers(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew()   { setForm({ ...EMPTY, position: metiers.length }); setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(m) { setForm(m); setEditing(m.id); setShowForm(true); setSaveErr(null) }

  async function save(e) {
    e.preventDefault(); setSaving(true); setSaveErr(null)
    const payload = { ...form, position: Number(form.position) }
    const { error } = editing
      ? await supabase.from('career_metiers').update(payload).eq('id', editing)
      : await supabase.from('career_metiers').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer ce métier ?')) return
    await supabase.from('career_metiers').delete().eq('id', id); load()
  }

  async function togglePublish(m) {
    await supabase.from('career_metiers').update({ published: !m.published }).eq('id', m.id); load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Métiers du Sport Business</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bandeau défilant affiché dans la page Career Center</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouveau métier</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier' : 'Nouveau métier'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titre du métier *</label>
              <input className="form-control" required value={form.title} onChange={set('title')}
                placeholder="ex: Directeur Marketing Sportif" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Position (ordre)</label>
              <input type="number" className="form-control" value={form.position} onChange={set('position')} min={0} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Photo de fond (portrait/vertical) *</label>
              <input className="form-control" value={form.photo_url} onChange={set('photo_url')}
                placeholder="https://… (format portrait recommandé)" />
              {form.photo_url && (
                <div className="mt-2 flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <img src={form.photo_url} alt="preview"
                    className="h-32 w-20 object-cover rounded-xl flex-shrink-0" />
                  <span className="text-xs text-gray-400 mt-1">Aperçu portrait</span>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description du métier</label>
              <textarea className="form-control" rows={4} value={form.description} onChange={set('description')}
                placeholder="En quoi consiste ce métier ? Missions, compétences, débouchés..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub-metier" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="pub-metier" className="text-sm text-gray-700 font-medium">Publier dans le bandeau</label>
            </div>
            {saveErr && (
              <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>
            )}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {metiers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">💼</div>
            <p className="font-medium">Aucun métier — cliquez sur « Nouveau métier »</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Photo / Titre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {metiers.map((m, i) => (
                <tr key={m.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === metiers.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3 text-gray-400 text-xs font-mono">{m.position}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.photo_url
                        ? <img src={m.photo_url} alt={m.title} className="h-10 w-7 object-cover rounded-lg flex-shrink-0" />
                        : <div className="w-7 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">?</div>
                      }
                      <span className="text-[13px] font-medium text-gray-900">{m.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell max-w-[240px]">
                    <p className="truncate">{m.description || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(m)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${m.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {m.published ? 'Publié' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(m)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Éditer</button>
                    <button onClick={() => remove(m.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Suppr.</button>
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
