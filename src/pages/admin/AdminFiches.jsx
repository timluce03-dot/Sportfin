import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const DIFFICULTIES = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']
const COLORS = [
  { value: 'blue',   label: '🔵 Bleu (Finance)' },
  { value: 'gold',   label: '🟡 Or (Stratégie)' },
  { value: 'green',  label: '🟢 Vert (Marketing)' },
  { value: 'purple', label: '🟣 Violet (Juridique)' },
  { value: 'red',    label: '🔴 Rouge (Management)' },
  { value: 'gray',   label: '⚫ Gris (Général)' },
]

const EMPTY = {
  title: '', subtitle: '', content: '', category: '',
  emoji: '📄', color: 'blue', difficulty: 'Intermédiaire',
  published: true, position: 0,
}

export default function AdminFiches() {
  const [fiches,    setFiches]    = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [editing,   setEditing]   = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState(null)

  async function load() {
    const { data } = await supabase.from('fiches').select('*').order('position')
    setFiches(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setForm({ ...EMPTY, position: fiches.length })
    setEditing(null); setShowForm(true); setSaveErr(null)
  }
  function openEdit(f) {
    setForm(f); setEditing(f.id); setShowForm(true); setSaveErr(null)
  }

  async function save(ev) {
    ev.preventDefault(); setSaving(true); setSaveErr(null)
    const payload = { ...form, position: Number(form.position) }
    const { error } = editing
      ? await supabase.from('fiches').update(payload).eq('id', editing)
      : await supabase.from('fiches').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer cette fiche ?')) return
    await supabase.from('fiches').delete().eq('id', id); load()
  }

  async function togglePublish(f) {
    await supabase.from('fiches').update({ published: !f.published }).eq('id', f.id); load()
  }

  async function move(f, dir) {
    const idx = fiches.findIndex(i => i.id === f.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= fiches.length) return
    const reordered = [...fiches]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    await Promise.all(reordered.map((it, pos) => supabase.from('fiches').update({ position: pos }).eq('id', it.id)))
    load()
  }

  const set = k => ev => setForm(f => ({ ...f, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }))

  const COLOR_MAP = {
    blue:   { bg: 'rgba(11,37,69,.08)',   color: '#0B2545', border: 'rgba(11,37,69,.2)' },
    gold:   { bg: 'rgba(201,168,76,.1)',  color: '#7a5c1e', border: 'rgba(201,168,76,.3)' },
    green:  { bg: 'rgba(16,185,129,.1)',  color: '#065f46', border: 'rgba(16,185,129,.25)' },
    purple: { bg: 'rgba(139,92,246,.1)',  color: '#5b21b6', border: 'rgba(139,92,246,.25)' },
    red:    { bg: 'rgba(239,68,68,.08)',  color: '#991b1b', border: 'rgba(239,68,68,.2)' },
    gray:   { bg: 'rgba(107,114,128,.08)', color: '#374151', border: 'rgba(107,114,128,.2)' },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Fiches de révision</h1>
          <p className="text-sm text-gray-500 mt-0.5">{fiches.length} fiche{fiches.length !== 1 ? 's' : ''} — affichées dans l'onglet Cours</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvelle fiche</button>
      </div>

      {/* Tips */}
      <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-[12.5px] text-indigo-800">
        <span className="text-lg flex-shrink-0">💡</span>
        <span>
          Dans le champ <strong>Contenu</strong>, structurez le texte ainsi :<br />
          <code className="bg-indigo-100 px-1 rounded text-[11px]"># Titre de section</code> pour les titres ·{' '}
          <code className="bg-indigo-100 px-1 rounded text-[11px]">- Point clé</code> pour les listes ·{' '}
          <code className="bg-indigo-100 px-1 rounded text-[11px]">**mot**</code> pour le gras
        </span>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier la fiche' : 'Nouvelle fiche'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
              <input className="form-control" required value={form.title} onChange={set('title')}
                placeholder="ex: Les droits TV dans le football professionnel" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sous-titre / accroche</label>
              <input className="form-control" value={form.subtitle} onChange={set('subtitle')}
                placeholder="ex: L'essentiel à retenir en 5 points clés" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
              <input className="form-control" value={form.category} onChange={set('category')}
                placeholder="ex: Finance, Juridique, Marketing…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Emoji</label>
              <input className="form-control" value={form.emoji} onChange={set('emoji')} placeholder="📄" maxLength={4} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Couleur</label>
              <select className="form-control" value={form.color} onChange={set('color')}>
                {COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Difficulté</label>
              <select className="form-control" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Contenu *
                <span className="font-normal text-gray-400 ml-1"># Titre · - Liste · **gras**</span>
              </label>
              <textarea className="form-control font-mono text-xs leading-relaxed" required rows={16} value={form.content} onChange={set('content')}
                placeholder={`# Définition\nLes droits TV sont les revenus issus de la cession des droits de diffusion…\n\n# Chiffres clés\n- 1,15 milliard € : droits TV Ligue 1 2024-2028\n- 40% : part moyenne des revenus des clubs L1\n\n# À retenir\n**Ligue 1** : Droits nationaux + internationaux\n**Champions League** : redistribution UEFA Market Pool`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
                <input type="number" className="form-control" value={form.position} onChange={set('position')} min={0} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Publier</span>
                </label>
              </div>
            </div>
            {saveErr && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer la fiche'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {fiches.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📄</div>
            <p className="font-medium">Aucune fiche — cliquez sur « Nouvelle fiche »</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-14 text-center">Ordre</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Fiche</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left hidden md:table-cell">Catégorie</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center hidden lg:table-cell">Difficulté</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Statut</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fiches.map((f, i) => {
                const c = COLOR_MAP[f.color] || COLOR_MAP.blue
                return (
                  <tr key={f.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === fiches.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <button onClick={() => move(f, 'up')} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↑</button>
                        <span className="text-xs text-gray-400 font-mono">{i + 1}</span>
                        <button onClick={() => move(f, 'down')} disabled={i === fiches.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↓</button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[18px] flex-shrink-0"
                          style={{ background: c.bg, border: `1px solid ${c.border}` }}>{f.emoji || '📄'}</div>
                        <div>
                          <div className="font-semibold text-gray-900 text-[13px]">{f.title}</div>
                          {f.subtitle && <div className="text-[11px] text-gray-400 mt-0.5">{f.subtitle}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500 hidden md:table-cell">{f.category || '—'}</td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{f.difficulty}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => togglePublish(f)}
                        className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${f.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {f.published ? 'Publiée' : 'Masquée'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right space-x-3">
                      <button onClick={() => openEdit(f)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Éditer</button>
                      <button onClick={() => remove(f.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Suppr.</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
