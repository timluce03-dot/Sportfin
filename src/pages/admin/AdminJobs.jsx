import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const DOMAINS    = ['Finance', 'Médias', 'Marketing', 'Sponsoring', 'Conseil', 'Data', 'Événementiel', 'Stratégie']
const CONTRACTS  = ['CDI', 'CDD', 'Stage', 'Interim']
const EMPTY = { title: '', company: '', location: '', contract: 'CDI', domain: '', duration: '', description: '', img: '', apply_url: '', published: true }

export default function AdminJobs() {
  const [jobs,     setJobs]     = useState([])
  const [form,     setForm]     = useState(EMPTY)
  const [editing,  setEditing]  = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saveErr,  setSaveErr]  = useState(null)
  const [search,   setSearch]   = useState('')

  async function load() {
    const { data } = await supabase.from('jobs').select('*').order('id', { ascending: false })
    setJobs(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew()  { setForm(EMPTY);  setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(j){ setForm(j);      setEditing(j.id); setShowForm(true); setSaveErr(null) }

  async function save(e) {
    e.preventDefault(); setSaving(true); setSaveErr(null)
    const { error } = editing
      ? await supabase.from('jobs').update(form).eq('id', editing)
      : await supabase.from('jobs').insert(form)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer cette offre ?')) return
    await supabase.from('jobs').delete().eq('id', id); load()
  }

  async function togglePublish(j) {
    await supabase.from('jobs').update({ published: !j.published }).eq('id', j.id); load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const filtered = jobs.filter(j =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) ||
               j.company.toLowerCase().includes(search.toLowerCase())
  )

  const CONTRACT_COLORS = { CDI: 'bg-emerald-100 text-emerald-700', CDD: 'bg-amber-100 text-amber-700', Stage: 'bg-blue-100 text-blue-700', Interim: 'bg-purple-100 text-purple-700' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Career Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">{jobs.length} offre{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvelle offre</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier l\'offre' : 'Nouvelle offre'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titre du poste *</label>
              <input className="form-control" required value={form.title} onChange={set('title')} placeholder="ex: Analyste Financier Sport Business" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Entreprise *</label>
              <input className="form-control" required value={form.company} onChange={set('company')} placeholder="ex: Olympique Lyonnais" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ville</label>
              <input className="form-control" value={form.location} onChange={set('location')} placeholder="ex: Paris" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Contrat</label>
              <select className="form-control" value={form.contract} onChange={set('contract')}>
                {CONTRACTS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Domaine</label>
              <select className="form-control" value={form.domain} onChange={set('domain')}>
                <option value="">— Choisir —</option>
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Durée</label>
              <input className="form-control" value={form.duration} onChange={set('duration')} placeholder="ex: 4-6 mois, >6 mois" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL logo / photo</label>
              <input className="form-control" value={form.img} onChange={set('img')} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={set('description')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL candidature</label>
              <input className="form-control" value={form.apply_url} onChange={set('apply_url')} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2 self-end pb-2">
              <input type="checkbox" id="pub-job" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="pub-job" className="text-sm text-gray-700 font-medium">Publier immédiatement</label>
            </div>
            {saveErr && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer l\'offre'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          className="form-control max-w-sm"
          placeholder="Rechercher un poste ou une entreprise…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">💼</div>
            <p className="font-medium">{search ? 'Aucun résultat' : 'Aucune offre — cliquez sur « Nouvelle offre »'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Poste</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Entreprise</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Ville</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Contrat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Domaine</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j, i) => (
                <tr key={j.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-[200px] truncate">{j.title}</td>
                  <td className="px-4 py-3 text-gray-600">{j.company}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{j.location || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${CONTRACT_COLORS[j.contract] || 'bg-gray-100 text-gray-600'}`}>
                      {j.contract}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{j.domain || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(j)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${j.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {j.published ? 'En ligne' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(j)} className="text-blue-600 hover:text-blue-800 font-medium mr-3">Éditer</button>
                    <button onClick={() => remove(j.id)} className="text-red-500 hover:text-red-700 font-medium">Suppr.</button>
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
