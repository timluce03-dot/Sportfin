import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { name: '', role: '', company: '', avatar: '', rating: 5, text: '', position: 0, published: true }

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className="text-2xl leading-none transition-colors"
          style={{ color: value >= s ? '#f59e0b' : '#d1d5db' }}>★</button>
      ))}
    </div>
  )
}

function Stars({ n }) {
  return <span style={{ color: '#f59e0b', fontSize: 13 }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}

async function moveItem(item, dir, items, load) {
  const sorted = [...items]
  const idx = sorted.findIndex(i => i.id === item.id)
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= sorted.length) return
  const reordered = [...sorted]
  ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
  await Promise.all(reordered.map((it, pos) => supabase.from('reviews').update({ position: pos }).eq('id', it.id)))
  load()
}

export default function AdminReviews() {
  const [reviews,  setReviews]  = useState([])
  const [form,     setForm]     = useState(EMPTY)
  const [editing,  setEditing]  = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saveErr,  setSaveErr]  = useState(null)

  async function load() {
    const { data } = await supabase.from('reviews').select('*').order('position')
    setReviews(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew()   { setForm({ ...EMPTY, position: reviews.length }); setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(r) { setForm(r); setEditing(r.id); setShowForm(true); setSaveErr(null) }

  async function save(ev) {
    ev.preventDefault(); setSaving(true); setSaveErr(null)
    const payload = { ...form, rating: Number(form.rating), position: Number(form.position) }
    const { error } = editing
      ? await supabase.from('reviews').update(payload).eq('id', editing)
      : await supabase.from('reviews').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer cet avis ?')) return
    await supabase.from('reviews').delete().eq('id', id); load()
  }

  async function togglePublish(r) {
    await supabase.from('reviews').update({ published: !r.published }).eq('id', r.id); load()
  }

  const set = k => ev => setForm(f => ({ ...f, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Avis utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reviews.length} avis</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvel avis</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier l\'avis' : 'Nouvel avis'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
              <input className="form-control" required value={form.name} onChange={set('name')} placeholder="ex: Sophie Martin" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Rôle / Poste</label>
              <input className="form-control" value={form.role} onChange={set('role')} placeholder="ex: Analyste financier" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Entreprise / Club</label>
              <input className="form-control" value={form.company} onChange={set('company')} placeholder="ex: Olympique Lyonnais" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL photo (avatar)</label>
              <input className="form-control" value={form.avatar} onChange={set('avatar')} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Note</label>
              <StarInput value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Position (ordre)</label>
              <input type="number" className="form-control" value={form.position} onChange={set('position')} min={0} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Témoignage *</label>
              <textarea className="form-control" rows={4} required value={form.text} onChange={set('text')}
                placeholder="Ce que l'utilisateur a dit de SportFin…" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub-rev" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="pub-rev" className="text-sm text-gray-700 font-medium">Publier</label>
            </div>
            {saveErr && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>}
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
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">⭐</div>
            <p className="font-medium">Aucun avis — cliquez sur « Nouvel avis »</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16 text-center">Ordre</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Auteur</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left hidden md:table-cell">Extrait</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center hidden lg:table-cell">Note</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Statut</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => (
                <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === reviews.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button onClick={() => moveItem(r, 'up', reviews, load)} disabled={i === 0}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↑</button>
                      <span className="text-xs text-gray-400 font-mono w-5 text-center">{i + 1}</span>
                      <button onClick={() => moveItem(r, 'down', reviews, load)} disabled={i === reviews.length - 1}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↓</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {r.avatar
                        ? <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: '#0B254520', color: '#0B2545' }}>{r.name[0]}</div>
                      }
                      <div>
                        <div className="font-medium text-gray-900 text-[13px]">{r.name}</div>
                        {(r.role || r.company) && (
                          <div className="text-[11px] text-gray-400">{[r.role, r.company].filter(Boolean).join(' · ')}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[280px]">
                    <div className="truncate text-[12px]">{r.text}</div>
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <Stars n={r.rating} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(r)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${r.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {r.published ? 'Publié' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-800 font-medium mr-3 text-[12.5px]">Éditer</button>
                    <button onClick={() => remove(r.id)} className="text-red-500 hover:text-red-700 font-medium text-[12.5px]">Suppr.</button>
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
