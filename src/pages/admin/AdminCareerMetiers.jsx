import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const BUCKET  = 'sportfin'
const FOLDER  = 'career-metiers'
const EMPTY   = { title: '', description: '', photo_url: '', position: 0, published: true }
const SPEEDS  = [
  { label: 'Lent',   value: '60s' },
  { label: 'Normal', value: '40s' },
  { label: 'Rapide', value: '24s' },
]

export default function AdminCareerMetiers() {
  const [metiers,    setMetiers]    = useState([])
  const [form,       setForm]       = useState(EMPTY)
  const [editing,    setEditing]    = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saveErr,    setSaveErr]    = useState(null)
  const [uploading,  setUploading]  = useState(false)
  const [speed,      setSpeed]      = useState(() => localStorage.getItem('sf-metiers-speed') || '40s')
  const [dragIdx,    setDragIdx]    = useState(null)
  const [dragOver,   setDragOver]   = useState(null)
  const fileRef = useRef(null)

  async function load() {
    const { data } = await supabase.from('career_metiers').select('*').order('position')
    setMetiers(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew()   { setForm({ ...EMPTY, position: metiers.length }); setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(m) { setForm(m); setEditing(m.id); setShowForm(true); setSaveErr(null) }

  // ── Photo upload ──────────────────────────────────────────────────────────
  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${FOLDER}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (upErr) { setSaveErr('Upload photo : ' + upErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
    setForm(f => ({ ...f, photo_url: publicUrl }))
    setUploading(false)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
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

  // ── Drag & drop reorder ───────────────────────────────────────────────────
  function onDragStart(i) { setDragIdx(i) }
  function onDragOver(e, i) { e.preventDefault(); setDragOver(i) }

  async function onDrop(e, targetIdx) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); setDragOver(null); return }
    const reordered = [...metiers]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(targetIdx, 0, moved)
    setMetiers(reordered)
    setDragIdx(null); setDragOver(null)
    // persist new positions
    await Promise.all(reordered.map((m, i) =>
      supabase.from('career_metiers').update({ position: i }).eq('id', m.id)
    ))
    load()
  }

  // ── Speed setting ─────────────────────────────────────────────────────────
  function changeSpeed(v) {
    setSpeed(v)
    localStorage.setItem('sf-metiers-speed', v)
    // push to the banner component via a custom event
    window.dispatchEvent(new CustomEvent('sf-metier-speed', { detail: v }))
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Métiers du Sport Business</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bandeau défilant — Career Center</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Speed */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-gray-500">Vitesse :</span>
            <div className="flex gap-1">
              {SPEEDS.map(s => (
                <button key={s.value} onClick={() => changeSpeed(s.value)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${speed === s.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouveau métier</button>
        </div>
      </div>

      {/* ── Form ── */}
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

            {/* Photo upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Photo de fond portrait *</label>
              <div className="flex gap-3 items-start">
                {form.photo_url && (
                  <div className="relative flex-shrink-0">
                    <img src={form.photo_url} alt="preview"
                      className="h-36 w-24 object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, photo_url: '' }))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">✕</button>
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-600 hover:text-blue-600 disabled:opacity-60 w-full justify-center"
                  >
                    {uploading ? (
                      <><span className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />Envoi en cours…</>
                    ) : (
                      <><span className="text-lg">📷</span>Choisir une photo depuis mon ordinateur</>
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[10px] text-gray-400 font-medium">ou</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <input className="form-control text-sm" value={form.photo_url} onChange={set('photo_url')}
                    placeholder="Coller une URL directement (https://…)" />
                </div>
              </div>
              <p className="text-[10.5px] text-gray-400 mt-1.5">Format portrait recommandé (ex: 400×600 px)</p>
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
              <button type="submit" disabled={saving || uploading}
                className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* ── List ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {metiers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">💼</div>
            <p className="font-medium">Aucun métier — cliquez sur « Nouveau métier »</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-medium">☰  Glisser-déposer les lignes pour réordonner</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8"></th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Photo / Titre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {metiers.map((m, i) => (
                  <tr
                    key={m.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={e => onDragOver(e, i)}
                    onDrop={e => onDrop(e, i)}
                    onDragEnd={() => { setDragIdx(null); setDragOver(null) }}
                    className={`border-b border-gray-50 transition-colors cursor-grab active:cursor-grabbing
                      ${dragOver === i && dragIdx !== i ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                      ${dragIdx === i ? 'opacity-40' : ''}
                      ${i === metiers.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-4 py-3 text-gray-300 select-none">⠿</td>
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
          </>
        )}
      </div>
    </div>
  )
}
