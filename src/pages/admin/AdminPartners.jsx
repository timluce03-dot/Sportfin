import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { name: '', logo_url: '', website_url: '', position: 0, published: true }

export default function AdminPartners() {
  const [partners,  setPartners]  = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [editing,   setEditing]   = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState(null)

  async function load() {
    const { data } = await supabase.from('partners').select('*').order('position')
    setPartners(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew()   { setForm({ ...EMPTY, position: partners.length }); setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(p) { setForm(p); setEditing(p.id); setShowForm(true); setSaveErr(null) }

  async function save(e) {
    e.preventDefault(); setSaving(true); setSaveErr(null)
    const payload = { ...form, position: Number(form.position) }
    const { error } = editing
      ? await supabase.from('partners').update(payload).eq('id', editing)
      : await supabase.from('partners').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer ce partenaire ?')) return
    await supabase.from('partners').delete().eq('id', id); load()
  }

  async function togglePublish(p) {
    await supabase.from('partners').update({ published: !p.published }).eq('id', p.id); load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Partenaires & Institutions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Logos affichés dans la bannière défilante sur les pages Cours et Certification</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouveau partenaire</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier' : 'Nouveau partenaire'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
              <input className="form-control" required value={form.name} onChange={set('name')}
                placeholder="ex: FFF, UEFA, CDES…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Position (ordre)</label>
              <input type="number" className="form-control" value={form.position} onChange={set('position')} min={0} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL du logo *</label>
              <input className="form-control" required value={form.logo_url} onChange={set('logo_url')}
                placeholder="https://… (PNG ou SVG, fond transparent de préférence)" />
              {form.logo_url && (
                <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <img src={form.logo_url} alt="preview" className="h-10 object-contain" style={{ maxWidth: 140 }} />
                  <span className="text-xs text-gray-400">Aperçu du logo</span>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Lien site web (optionnel)</label>
              <input className="form-control" value={form.website_url} onChange={set('website_url')}
                placeholder="https://www.fff.fr" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub-partner" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="pub-partner" className="text-sm text-gray-700 font-medium">Publier dans la bannière</label>
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

      {/* Preview bannière */}
      {partners.filter(p => p.published && p.logo_url).length > 0 && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
            Aperçu de la bannière
          </div>
          <div className="bg-white py-4 px-6 flex items-center gap-8 overflow-x-auto">
            {partners.filter(p => p.published && p.logo_url).map(p => (
              <img key={p.id} src={p.logo_url} alt={p.name} className="h-8 object-contain opacity-70 flex-shrink-0" style={{ maxWidth: 120 }} />
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {partners.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🤝</div>
            <p className="font-medium">Aucun partenaire — cliquez sur « Nouveau partenaire »</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Logo / Nom</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Site web</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === partners.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3 text-gray-400 text-xs font-mono">{p.position}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.logo_url
                        ? <img src={p.logo_url} alt={p.name} className="h-7 object-contain flex-shrink-0 opacity-80" style={{ maxWidth: 80 }} />
                        : <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">?</div>
                      }
                      <span className="text-[13px] font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell truncate max-w-[180px]">
                    {p.website_url || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(p)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${p.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {p.published ? 'Publié' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Éditer</button>
                    <button onClick={() => remove(p.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Suppr.</button>
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
