import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const BUCKET = 'sportfin'
const FOLDER = 'team'
const EMPTY  = { first_name: '', last_name: '', role: '', bio: '', photo_url: '', position: 0, published: true }

export default function AdminTeam() {
  const [members,   setMembers]   = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [editing,   setEditing]   = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saveErr,   setSaveErr]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragIdx,   setDragIdx]   = useState(null)
  const [dragOver,  setDragOver]  = useState(null)
  const fileRef = useRef(null)

  async function load() {
    const { data } = await supabase.from('team_members').select('*').order('position')
    setMembers(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew()   { setForm({ ...EMPTY, position: members.length }); setEditing(null); setShowForm(true); setSaveErr(null) }
  function openEdit(m) { setForm(m); setEditing(m.id); setShowForm(true); setSaveErr(null) }

  async function handleFile(e) {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    const path = `${FOLDER}/${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (error) { setSaveErr('Upload : ' + error.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
    setForm(f => ({ ...f, photo_url: publicUrl }))
    setUploading(false)
  }

  async function save(e) {
    e.preventDefault(); setSaving(true); setSaveErr(null)
    const payload = { ...form, position: Number(form.position) }
    const { error } = editing
      ? await supabase.from('team_members').update(payload).eq('id', editing)
      : await supabase.from('team_members').insert(payload)
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer ce membre ?')) return
    await supabase.from('team_members').delete().eq('id', id); load()
  }

  async function togglePublish(m) {
    await supabase.from('team_members').update({ published: !m.published }).eq('id', m.id); load()
  }

  async function onDrop(e, targetIdx) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === targetIdx) { setDragIdx(null); setDragOver(null); return }
    const arr = [...members]
    const [moved] = arr.splice(dragIdx, 1)
    arr.splice(targetIdx, 0, moved)
    setMembers(arr); setDragIdx(null); setDragOver(null)
    await Promise.all(arr.map((m, i) => supabase.from('team_members').update({ position: i }).eq('id', m.id)))
    load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Équipe SportFin</h1>
          <p className="text-sm text-gray-500 mt-0.5">Affiché sur la page d'accueil — hover pour voir le parcours</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouveau membre</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier' : 'Nouveau membre'}</h2>
          <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Prénom *</label>
              <input className="form-control" required value={form.first_name} onChange={set('first_name')} placeholder="Prénom" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
              <input className="form-control" required value={form.last_name} onChange={set('last_name')} placeholder="Nom" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Rôle / Titre</label>
              <input className="form-control" value={form.role} onChange={set('role')} placeholder="ex: Directeur Pédagogique" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
              <input type="number" className="form-control" value={form.position} onChange={set('position')} min={0} />
            </div>

            {/* Photo */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Photo portrait *</label>
              <div className="flex gap-4 items-start">
                {form.photo_url && (
                  <div className="relative flex-shrink-0">
                    <img src={form.photo_url} alt="preview" className="h-36 w-24 object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, photo_url: '' }))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">✕</button>
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-500 hover:text-blue-600 disabled:opacity-60 w-full">
                    {uploading ? <><span className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />Envoi…</> : <><span>📷</span>Choisir une photo</>}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  <div className="flex items-center gap-2"><div className="flex-1 h-px bg-gray-100"/><span className="text-[10px] text-gray-400">ou</span><div className="flex-1 h-px bg-gray-100"/></div>
                  <input className="form-control text-sm" value={form.photo_url} onChange={set('photo_url')} placeholder="URL directe (https://…)" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Parcours / Bio</label>
              <textarea className="form-control" rows={4} value={form.bio} onChange={set('bio')}
                placeholder="Formation, expériences, expertises… (visible au hover sur l'accueil)" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub-team" checked={form.published} onChange={set('published')} className="w-4 h-4 accent-blue-600" />
              <label htmlFor="pub-team" className="text-sm text-gray-700 font-medium">Publier sur l'accueil</label>
            </div>
            {saveErr && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{saveErr}</div>}
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving || uploading} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {members.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">👥</div>
            <p className="font-medium">Aucun membre — cliquez sur « Nouveau membre »</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-[11px] text-gray-400 font-medium">☰ Glisser-déposer pour réordonner</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-8 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Photo / Nom</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Rôle</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m.id} draggable
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={e => { e.preventDefault(); setDragOver(i) }}
                    onDrop={e => onDrop(e, i)}
                    onDragEnd={() => { setDragIdx(null); setDragOver(null) }}
                    className={`border-b border-gray-50 cursor-grab active:cursor-grabbing transition-colors
                      ${dragOver === i && dragIdx !== i ? 'bg-blue-50' : 'hover:bg-gray-50'}
                      ${dragIdx === i ? 'opacity-40' : ''}
                      ${i === members.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-4 py-3 text-gray-300 select-none">⠿</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {m.photo_url
                          ? <img src={m.photo_url} alt="" className="h-10 w-7 object-cover rounded-lg flex-shrink-0" />
                          : <div className="w-7 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold">{m.first_name[0]}{m.last_name[0]}</div>
                        }
                        <span className="text-[13px] font-semibold text-gray-900">{m.first_name} {m.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{m.role || '—'}</td>
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
