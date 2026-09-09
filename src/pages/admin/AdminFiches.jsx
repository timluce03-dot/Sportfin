import { useState, useEffect, useRef } from 'react'
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
  title: '', subtitle: '', pdf_url: '', category: '',
  emoji: '📄', color: 'blue', difficulty: 'Intermédiaire',
  published: true, position: 0,
}

export default function AdminFiches() {
  const [fiches,    setFiches]    = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [editing,   setEditing]   = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saveErr,   setSaveErr]   = useState(null)
  const fileRef                   = useRef()

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

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setSaveErr('Fichier PDF uniquement'); return }
    setUploading(true); setSaveErr(null)
    const path = `fiches/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const { error } = await supabase.storage.from('sportfin').upload(path, file, { upsert: true })
    if (error) { setSaveErr(`Upload échoué : ${error.message}`); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('sportfin').getPublicUrl(path)
    setForm(f => ({ ...f, pdf_url: publicUrl }))
    setUploading(false)
  }

  async function save(ev) {
    ev.preventDefault(); setSaving(true); setSaveErr(null)
    if (!form.pdf_url) { setSaveErr('Veuillez uploader un PDF avant de sauvegarder.'); setSaving(false); return }
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
    blue:   { bg: 'rgba(11,37,69,.08)',    border: 'rgba(11,37,69,.2)' },
    gold:   { bg: 'rgba(201,168,76,.1)',   border: 'rgba(201,168,76,.3)' },
    green:  { bg: 'rgba(16,185,129,.1)',   border: 'rgba(16,185,129,.25)' },
    purple: { bg: 'rgba(139,92,246,.1)',   border: 'rgba(139,92,246,.25)' },
    red:    { bg: 'rgba(239,68,68,.08)',   border: 'rgba(239,68,68,.2)' },
    gray:   { bg: 'rgba(107,114,128,.08)', border: 'rgba(107,114,128,.2)' },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Fiches de révision</h1>
          <p className="text-sm text-gray-500 mt-0.5">{fiches.length} fiche{fiches.length !== 1 ? 's' : ''} — PDF affichés dans l'onglet Cours</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvelle fiche</button>
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

            {/* PDF Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Fichier PDF *</label>
              <div className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors ${form.pdf_url ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300'}`}>
                {form.pdf_url ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-emerald-700">PDF uploadé avec succès</p>
                        <a href={form.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-emerald-600 hover:underline truncate block max-w-xs">
                          Aperçu du PDF →
                        </a>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setForm(f => ({ ...f, pdf_url: '' })); if (fileRef.current) fileRef.current.value = '' }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium">
                      Changer
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">📄</div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {uploading ? 'Upload en cours…' : 'Glissez un PDF ou cliquez pour choisir'}
                    </p>
                    <p className="text-xs text-gray-400 mb-3">Fichiers PDF uniquement</p>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="btn-primary text-xs px-4 py-2 disabled:opacity-60">
                      {uploading ? '⏳ Upload…' : 'Choisir un PDF'}
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
              </div>
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
              <button type="submit" disabled={saving || uploading} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
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
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center hidden lg:table-cell">PDF</th>
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
                      {f.pdf_url
                        ? <a href={f.pdf_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-blue-600 hover:underline">Voir PDF →</a>
                        : <span className="text-[11px] text-gray-400">—</span>}
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
