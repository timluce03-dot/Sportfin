import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = { question: '', answer: '', position: 0, published: true }

export default function AdminFaq() {
  const [items,     setItems]     = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [editing,   setEditing]   = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState(null)

  async function load() {
    const { data } = await supabase.from('faq').select('*').order('position')
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setForm({ ...EMPTY, position: items.length })
    setEditing(null); setShowForm(true); setSaveErr(null)
  }
  function openEdit(item) {
    setForm(item); setEditing(item.id); setShowForm(true); setSaveErr(null)
  }

  async function save(ev) {
    ev.preventDefault(); setSaving(true); setSaveErr(null)
    const payload = { ...form, position: Number(form.position) }
    const { error } = editing
      ? await supabase.from('faq').update(payload).eq('id', editing)
      : await supabase.from('faq').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer cette question ?')) return
    await supabase.from('faq').delete().eq('id', id); load()
  }

  async function togglePublish(item) {
    await supabase.from('faq').update({ published: !item.published }).eq('id', item.id); load()
  }

  async function move(item, dir) {
    const idx = items.findIndex(i => i.id === item.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= items.length) return
    const reordered = [...items]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    await Promise.all(reordered.map((it, pos) => supabase.from('faq').update({ position: pos }).eq('id', it.id)))
    load()
  }

  const set = k => ev => setForm(f => ({ ...f, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">FAQ</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} question{items.length !== 1 ? 's' : ''} — affichées sur la page Profil</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvelle question</button>
      </div>

      {/* Hint */}
      <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-[12.5px] text-blue-800">
        <span className="text-lg flex-shrink-0">💡</span>
        <span>Les 10 premières questions (par ordre de position) sont affichées par défaut sur la page <strong>Profil</strong>. Un bouton « Voir plus » apparaît au-delà.</span>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier la question' : 'Nouvelle question'}</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Question *</label>
              <input className="form-control" required value={form.question} onChange={set('question')}
                placeholder="ex: Puis-je annuler mon abonnement à tout moment ?" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Réponse *</label>
              <textarea className="form-control" required rows={4} value={form.answer} onChange={set('answer')}
                placeholder="Rédigez la réponse complète ici…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Position (ordre)</label>
                <input type="number" className="form-control" value={form.position} onChange={set('position')} min={0} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Publier</span>
                </label>
              </div>
            </div>
            {saveErr && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">❓</div>
            <p className="font-medium">Aucune question — cliquez sur « Nouvelle question »</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-14 text-center">Ordre</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Question / Réponse</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Statut</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === items.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <button onClick={() => move(item, 'up')} disabled={i === 0}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↑</button>
                      <span className="text-xs text-gray-400 font-mono">{i + 1}</span>
                      <button onClick={() => move(item, 'down')} disabled={i === items.length - 1}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↓</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[520px]">
                    <div className="font-semibold text-gray-900 text-[13px] mb-1">{item.question}</div>
                    <div className="text-[12px] text-gray-500 line-clamp-2">{item.answer}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => togglePublish(item)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${item.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {item.published ? 'Publié' : 'Masqué'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Éditer</button>
                    <button onClick={() => remove(item.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Suppr.</button>
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
