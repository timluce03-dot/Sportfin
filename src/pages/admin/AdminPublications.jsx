import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { getAllPublications, upsertPublication, deletePublication } from '../../services/publicationsService'

const SERIES = [
  { id: 'le-move',    label: 'Le Move',     color: '#C9A84C', desc: 'Stratégie & Marketing' },
  { id: 'money-time', label: 'Money Time',  color: '#10b981', desc: 'Finance & Chiffres' },
  { id: 'top-tier',   label: 'Top Tier',    color: '#8b5cf6', desc: 'Classements' },
]

const EMPTY = { series: 'le-move', images: [], published: true, position: 0 }

export default function AdminPublications() {
  const [pubs,      setPubs]      = useState([])
  const [form,      setForm]      = useState(EMPTY)
  const [editing,   setEditing]   = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState(null)
  const fileRef = useRef()

  async function load() {
    const { data } = await getAllPublications()
    setPubs(data || [])
  }
  useEffect(() => { load() }, [])

  function openNew() {
    setForm({ ...EMPTY, position: pubs.length })
    setEditing(null); setShowForm(true); setErr(null)
  }
  function openEdit(p) {
    setForm({ series: p.series, images: p.images || [], published: p.published, position: p.position })
    setEditing(p.id); setShowForm(true); setErr(null)
  }

  async function handleFiles(files) {
    if (!files?.length) return
    const pngFiles = Array.from(files).filter(f => f.type === 'image/png' || f.name.endsWith('.png') || f.name.endsWith('.jpg') || f.name.endsWith('.jpeg') || f.name.endsWith('.webp'))
    if (!pngFiles.length) { setErr('Seulement les fichiers image (PNG, JPG) sont acceptés'); return }
    setUploading(true); setErr(null)
    const urls = []
    for (const file of pngFiles) {
      const path = `publications/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const { error } = await supabase.storage.from('sportfin').upload(path, file, { upsert: true })
      if (error) { setErr(`Erreur upload : ${error.message}`); setUploading(false); return }
      const { data: { publicUrl } } = supabase.storage.from('sportfin').getPublicUrl(path)
      urls.push(publicUrl)
    }
    setForm(f => ({ ...f, images: [...f.images, ...urls] }))
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  function moveImage(idx, dir) {
    const imgs = [...form.images]
    const swap = idx + dir
    if (swap < 0 || swap >= imgs.length) return
    ;[imgs[idx], imgs[swap]] = [imgs[swap], imgs[idx]]
    setForm(f => ({ ...f, images: imgs }))
  }

  async function save(ev) {
    ev.preventDefault(); setSaving(true); setErr(null)
    if (!form.images.length) { setErr('Ajoutez au moins une image'); setSaving(false); return }
    const payload = { series: form.series, images: form.images, published: form.published, position: Number(form.position) }
    const { error } = await upsertPublication(payload, editing)
    setSaving(false)
    if (error) { setErr(error); return }
    setShowForm(false); load()
  }

  async function remove(id) {
    if (!confirm('Supprimer cette publication ?')) return
    await deletePublication(id); load()
  }

  async function togglePublish(p) {
    await supabase.from('publications').update({ published: !p.published }).eq('id', p.id); load()
  }

  const bySeriesColor = id => SERIES.find(s => s.id === id)?.color || '#C9A84C'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Publications Instagram</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pubs.length} publication{pubs.length !== 1 ? 's' : ''} — carousels affichés dans les articles</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm px-4 py-2">+ Nouvelle publication</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
          <h2 className="font-bold text-gray-900 mb-5">{editing ? 'Modifier la publication' : 'Nouvelle publication'}</h2>
          <form onSubmit={save} className="space-y-5">

            {/* Series */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Série *</label>
              <div className="flex gap-3">
                {SERIES.map(s => (
                  <button key={s.id} type="button"
                    onClick={() => setForm(f => ({ ...f, series: s.id }))}
                    className="flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all"
                    style={form.series === s.id
                      ? { borderColor: s.color, background: `${s.color}15` }
                      : { borderColor: '#e5e7eb', background: '#fafafa' }}>
                    <div className="font-bold text-[13px]" style={{ color: form.series === s.id ? s.color : '#374151' }}>{s.label}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Cartes (PNG / JPG) * — glissez les fichiers dans l'ordre de lecture
              </label>
              <div
                className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}>
                {uploading ? (
                  <p className="text-sm font-semibold text-blue-600">Upload en cours…</p>
                ) : (
                  <>
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="text-sm font-semibold text-gray-700">Glissez vos images ici ou cliquez pour choisir</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG — plusieurs fichiers acceptés à la fois</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => handleFiles(e.target.files)} />
              </div>
            </div>

            {/* Cards preview */}
            {form.images.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Cartes ({form.images.length}) — réorganisez avec les flèches, la première est la couverture
                </label>
                <div className="flex gap-3 flex-wrap">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                      style={{ width: 100, flexShrink: 0 }}>
                      <img src={url} alt={`carte ${i + 1}`} className="w-full object-cover" style={{ aspectRatio: '4/5' }} />
                      {i === 0 && (
                        <div className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: bySeriesColor(form.series), color: '#fff' }}>COVER</div>
                      )}
                      <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                        <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                          className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center disabled:opacity-20"
                          style={{ background: 'rgba(0,0,0,.6)', color: '#fff' }}>↑</button>
                        <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1}
                          className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center disabled:opacity-20"
                          style={{ background: 'rgba(0,0,0,.6)', color: '#fff' }}>↓</button>
                      </div>
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute bottom-1 right-1 w-5 h-5 rounded text-[10px] flex items-center justify-center"
                        style={{ background: 'rgba(220,38,38,.85)', color: '#fff' }}>×</button>
                      <div className="absolute bottom-1 left-1 text-[9px] font-bold px-1 rounded"
                        style={{ background: 'rgba(0,0,0,.5)', color: '#fff' }}>{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Position + Published */}
            <div className="flex items-center gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
                <input type="number" min={0} className="form-control w-20"
                  value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input type="checkbox" checked={form.published}
                  onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-medium text-gray-700">Publier</span>
              </label>
            </div>

            {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{err}</div>}

            <div className="flex gap-3">
              <button type="submit" disabled={saving || uploading} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer la publication'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {pubs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📸</div>
          <p className="font-medium">Aucune publication — cliquez sur « Nouvelle publication »</p>
        </div>
      ) : (
        <div className="space-y-4">
          {['le-move', 'money-time', 'top-tier'].map(seriesId => {
            const s = SERIES.find(x => x.id === seriesId)
            const items = pubs.filter(p => p.series === seriesId)
            if (!items.length) return null
            return (
              <div key={seriesId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-3"
                  style={{ background: `${s.color}12`, borderBottom: `2px solid ${s.color}30` }}>
                  <span className="font-bold text-[13px]" style={{ color: s.color }}>{s.label}</span>
                  <span className="text-[11px] text-gray-400">{s.desc}</span>
                  <span className="ml-auto text-[11px] text-gray-400">{items.length} publication{items.length > 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map(p => (
                    <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                      {/* Thumbnail strip */}
                      <div className="flex gap-1.5 flex-shrink-0">
                        {(p.images || []).slice(0, 4).map((url, i) => (
                          <img key={i} src={url} alt="" className="rounded-lg object-cover"
                            style={{ width: 40, height: 50, flexShrink: 0 }} />
                        ))}
                        {(p.images || []).length > 4 && (
                          <div className="rounded-lg flex items-center justify-center text-[10px] font-bold"
                            style={{ width: 40, height: 50, background: `${s.color}18`, color: s.color }}>
                            +{p.images.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-700">{p.images?.length || 0} carte{p.images?.length !== 1 ? 's' : ''}</p>
                        <p className="text-[11px] text-gray-400">Position {p.position}</p>
                      </div>
                      <button onClick={() => togglePublish(p)}
                        className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${p.published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.published ? 'Publiée' : 'Masquée'}
                      </button>
                      <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Éditer</button>
                      <button onClick={() => remove(p.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Suppr.</button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
