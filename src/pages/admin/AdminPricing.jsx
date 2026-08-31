import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { name: '', price: '', period: '/mois', subtitle: '', engagement: '', highlighted: false, cta_label: 'Commencer', position: 0, published: true }

async function moveItem(item, dir, items, load) {
  const idx = items.findIndex(i => i.id === item.id)
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return
  const reordered = [...items]
  ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
  await Promise.all(reordered.map((it, pos) => supabase.from('plans').update({ position: pos }).eq('id', it.id)))
  load()
}

export default function AdminPricing() {
  const [plans,     setPlans]     = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [featText,  setFeatText]  = useState('')
  const [editing,   setEditing]   = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState(null)

  async function load() {
    const { data } = await supabase.from('plans').select('*').order('position')
    setPlans(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setForm({ ...EMPTY, position: plans.length })
    setFeatText('')
    setEditing(null); setShowForm(true)
  }
  function openEdit(p) {
    setForm(p)
    setFeatText(Array.isArray(p.features) ? p.features.join('\n') : '')
    setEditing(p.id); setShowForm(true)
  }

  async function save(ev) {
    ev.preventDefault(); setSaving(true); setSaveErr(null)
    const features = featText.split('\n').map(s => s.trim()).filter(Boolean)
    const payload = { ...form, features, position: Number(form.position) }
    const { error } = editing
      ? await supabase.from('plans').update(payload).eq('id', editing)
      : await supabase.from('plans').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer ce plan tarifaire ?')) return
    await supabase.from('plans').delete().eq('id', id); load()
  }

  async function togglePublish(p) {
    await supabase.from('plans').update({ published: !p.published }).eq('id', p.id); load()
  }

  const set = k => ev => setForm(f => ({ ...f, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Tarifs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouveau plan</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier le plan' : 'Nouveau plan'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du plan *</label>
              <input className="form-control" required value={form.name} onChange={set('name')} placeholder="ex: Premium" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sous-titre</label>
              <input className="form-control" value={form.subtitle} onChange={set('subtitle')} placeholder="ex: Le plan complet" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Prix</label>
              <input className="form-control" value={form.price} onChange={set('price')} placeholder="ex: 39,99€" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Période</label>
              <input className="form-control" value={form.period} onChange={set('period')} placeholder="ex: /mois  ou  unique" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Texte du bouton CTA</label>
              <input className="form-control" value={form.cta_label} onChange={set('cta_label')} placeholder="ex: Commencer" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Position (ordre)</label>
              <input type="number" className="form-control" value={form.position} onChange={set('position')} min={0} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Fonctionnalités incluses
                <span className="font-normal text-gray-400 ml-1">(une par ligne)</span>
              </label>
              <textarea className="form-control font-mono text-xs" rows={8} value={featText} onChange={e => setFeatText(e.target.value)}
                placeholder="Accès à tous les cours&#10;Quiz illimités&#10;Attestation de fin de formation&#10;…" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Engagement</label>
              <input className="form-control" value={form.engagement} onChange={set('engagement')}
                placeholder="ex: Engagement 3 mois minimum" />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="highlighted" checked={form.highlighted} onChange={set('highlighted')} className="w-4 h-4 accent-amber-500" />
                <span className="text-sm font-medium text-gray-700">Plan mis en avant</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="pub-plan" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-medium text-gray-700">Publier</span>
              </label>
            </div>
            {saveErr && (
              <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>
            )}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {plans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">💎</div>
            <p className="font-medium">Aucun plan — cliquez sur « Nouveau plan »</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16 text-center">Ordre</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Plan</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Prix</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center hidden md:table-cell">Avantages</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Statut</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p, i) => (
                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === plans.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button onClick={() => moveItem(p, 'up', plans, load)} disabled={i === 0}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↑</button>
                      <span className="text-xs text-gray-400 font-mono">{i + 1}</span>
                      <button onClick={() => moveItem(p, 'down', plans, load)} disabled={i === plans.length - 1}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↓</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{p.name}</span>
                      {p.highlighted && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">⭐ Mis en avant</span>}
                    </div>
                    {p.subtitle && <div className="text-xs text-gray-400 mt-0.5">{p.subtitle}</div>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {p.price || '—'}<span className="font-normal text-gray-400 text-xs">{p.period}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs hidden md:table-cell">
                    {Array.isArray(p.features) ? `${p.features.length} avantage${p.features.length !== 1 ? 's' : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(p)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${p.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {p.published ? 'Publié' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 font-medium mr-3 text-[12.5px]">Éditer</button>
                    <button onClick={() => remove(p.id)} className="text-red-500 hover:text-red-700 font-medium text-[12.5px]">Suppr.</button>
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
