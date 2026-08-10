import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const LEVEL_EMPTY  = { name: '', badge: '🏅', tagline: '', description: '', price: '', duration: '', position: 0, published: true }
const BRAND_EMPTY  = { name: '', logo_url: '', description: '', position: 0, published: true }

async function moveItem(item, dir, items, table, load) {
  const idx = items.findIndex(i => i.id === item.id)
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return
  const reordered = [...items]
  ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
  await Promise.all(reordered.map((it, pos) => supabase.from(table).update({ position: pos }).eq('id', it.id)))
  load()
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
      {children}
    </button>
  )
}

export default function AdminCertification() {
  const [tab, setTab] = useState('levels')

  // ── Levels ───────────────────────────────────────────────────
  const [levels,     setLevels]     = useState([])
  const [levelForm,  setLevelForm]  = useState(LEVEL_EMPTY)
  const [editLevel,  setEditLevel]  = useState(null)
  const [showLevel,  setShowLevel]  = useState(false)
  const [savingL,    setSavingL]    = useState(false)

  // ── Brands ───────────────────────────────────────────────────
  const [brands,     setBrands]     = useState([])
  const [brandForm,  setBrandForm]  = useState(BRAND_EMPTY)
  const [editBrand,  setEditBrand]  = useState(null)
  const [showBrand,  setShowBrand]  = useState(false)
  const [savingB,    setSavingB]    = useState(false)

  async function loadLevels() {
    const { data } = await supabase.from('certification_levels').select('*').order('position')
    setLevels(data || [])
  }
  async function loadBrands() {
    const { data } = await supabase.from('certification_brands').select('*').order('position')
    setBrands(data || [])
  }
  useEffect(() => { loadLevels(); loadBrands() }, [])

  // Level CRUD
  function openNewLevel()   { setLevelForm({ ...LEVEL_EMPTY, position: levels.length }); setEditLevel(null); setShowLevel(true) }
  function openEditLevel(l) { setLevelForm(l); setEditLevel(l.id); setShowLevel(true) }

  async function saveLevel(ev) {
    ev.preventDefault(); setSavingL(true)
    const payload = { ...levelForm, position: Number(levelForm.position) }
    editLevel
      ? await supabase.from('certification_levels').update(payload).eq('id', editLevel)
      : await supabase.from('certification_levels').insert(payload)
    setSavingL(false); setShowLevel(false); loadLevels()
  }

  async function removeLevel(id) {
    if (!confirm('Supprimer ce niveau ?')) return
    await supabase.from('certification_levels').delete().eq('id', id); loadLevels()
  }

  async function toggleLevel(l) {
    await supabase.from('certification_levels').update({ published: !l.published }).eq('id', l.id); loadLevels()
  }

  // Brand CRUD
  function openNewBrand()   { setBrandForm({ ...BRAND_EMPTY, position: brands.length }); setEditBrand(null); setShowBrand(true) }
  function openEditBrand(b) { setBrandForm(b); setEditBrand(b.id); setShowBrand(true) }

  async function saveBrand(ev) {
    ev.preventDefault(); setSavingB(true)
    const payload = { ...brandForm, position: Number(brandForm.position) }
    editBrand
      ? await supabase.from('certification_brands').update(payload).eq('id', editBrand)
      : await supabase.from('certification_brands').insert(payload)
    setSavingB(false); setShowBrand(false); loadBrands()
  }

  async function removeBrand(id) {
    if (!confirm('Supprimer cette marque ?')) return
    await supabase.from('certification_brands').delete().eq('id', id); loadBrands()
  }

  async function toggleBrand(b) {
    await supabase.from('certification_brands').update({ published: !b.published }).eq('id', b.id); loadBrands()
  }

  const setL = k => ev => setLevelForm(f => ({ ...f, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }))
  const setB = k => ev => setBrandForm(f => ({ ...f, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Certification</h1>
          <p className="text-sm text-gray-500 mt-0.5">{levels.length} niveau{levels.length !== 1 ? 'x' : ''} · {brands.length} marque{brands.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/certification" target="_blank" rel="noopener noreferrer"
            className="text-[13px] font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1">
            👁 Aperçu
          </Link>
          <button onClick={tab === 'levels' ? openNewLevel : openNewBrand} className="btn-primary text-sm px-4 py-2">
            {tab === 'levels' ? '+ Nouveau niveau' : '+ Nouvelle marque'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 mb-6 w-fit">
        <TabBtn active={tab === 'levels'} onClick={() => setTab('levels')}>🏅 Niveaux</TabBtn>
        <TabBtn active={tab === 'brands'} onClick={() => setTab('brands')}>🏢 Marques partenaires</TabBtn>
      </div>

      {/* ── LEVELS TAB ───────────────────────────────────────── */}
      {tab === 'levels' && (
        <>
          {showLevel && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
              <h2 className="font-bold text-gray-900 mb-5">{editLevel ? 'Modifier le niveau' : 'Nouveau niveau'}</h2>
              <form onSubmit={saveLevel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                  <input className="form-control" required value={levelForm.name} onChange={setL('name')} placeholder="ex: SportFin Certified SBM+" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Badge (emoji)</label>
                  <input className="form-control" value={levelForm.badge} onChange={setL('badge')} placeholder="🏅" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tagline</label>
                  <input className="form-control" value={levelForm.tagline} onChange={setL('tagline')} placeholder="ex: La certification fondamentale" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea className="form-control" rows={3} value={levelForm.description} onChange={setL('description')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Prix</label>
                  <input className="form-control" value={levelForm.price} onChange={setL('price')} placeholder="ex: 59,99€" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Durée accès</label>
                  <input className="form-control" value={levelForm.duration} onChange={setL('duration')} placeholder="ex: 2h · accès à vie" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
                  <input type="number" className="form-control" value={levelForm.position} onChange={setL('position')} min={0} />
                </div>
                <div className="flex items-center gap-2 self-end pb-1">
                  <input type="checkbox" id="pub-level" checked={levelForm.published} onChange={setL('published')} className="w-4 h-4 accent-blue-600" />
                  <label htmlFor="pub-level" className="text-sm font-medium text-gray-700">Publier</label>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" disabled={savingL} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                    {savingL ? 'Enregistrement…' : editLevel ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button type="button" onClick={() => setShowLevel(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {levels.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🏅</div>
                <p className="font-medium">Aucun niveau — cliquez sur « Nouveau niveau »</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16 text-center">Ordre</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Niveau</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left hidden md:table-cell">Prix</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Statut</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {levels.map((l, i) => (
                    <tr key={l.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === levels.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <button onClick={() => moveItem(l, 'up', levels, 'certification_levels', loadLevels)} disabled={i === 0}
                            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↑</button>
                          <span className="text-xs text-gray-400 font-mono">{i + 1}</span>
                          <button onClick={() => moveItem(l, 'down', levels, 'certification_levels', loadLevels)} disabled={i === levels.length - 1}
                            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↓</button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{l.badge}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{l.name}</div>
                            {l.tagline && <div className="text-xs text-gray-400">{l.tagline}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium hidden md:table-cell">{l.price || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleLevel(l)}
                          className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${l.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {l.published ? 'Publié' : 'Masqué'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => openEditLevel(l)} className="text-blue-600 hover:text-blue-800 font-medium mr-3 text-[12.5px]">Éditer</button>
                        <button onClick={() => removeLevel(l.id)} className="text-red-500 hover:text-red-700 font-medium text-[12.5px]">Suppr.</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── BRANDS TAB ───────────────────────────────────────── */}
      {tab === 'brands' && (
        <>
          {showBrand && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-100">
              <h2 className="font-bold text-gray-900 mb-5">{editBrand ? 'Modifier la marque' : 'Nouvelle marque'}</h2>
              <form onSubmit={saveBrand} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                  <input className="form-control" required value={brandForm.name} onChange={setB('name')} placeholder="ex: UEFA" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">URL logo</label>
                  <input className="form-control" value={brandForm.logo_url} onChange={setB('logo_url')} placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description courte</label>
                  <input className="form-control" value={brandForm.description} onChange={setB('description')} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Position</label>
                  <input type="number" className="form-control" value={brandForm.position} onChange={setB('position')} min={0} />
                </div>
                <div className="flex items-center gap-2 self-end pb-1">
                  <input type="checkbox" id="pub-brand" checked={brandForm.published} onChange={setB('published')} className="w-4 h-4 accent-blue-600" />
                  <label htmlFor="pub-brand" className="text-sm font-medium text-gray-700">Publier</label>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" disabled={savingB} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                    {savingB ? 'Enregistrement…' : editBrand ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button type="button" onClick={() => setShowBrand(false)} className="btn-ghost text-sm px-5 py-2">Annuler</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {brands.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🏢</div>
                <p className="font-medium">Aucune marque — cliquez sur « Nouvelle marque »</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16 text-center">Ordre</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">Marque</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Statut</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((b, i) => (
                    <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === brands.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <button onClick={() => moveItem(b, 'up', brands, 'certification_brands', loadBrands)} disabled={i === 0}
                            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↑</button>
                          <span className="text-xs text-gray-400 font-mono">{i + 1}</span>
                          <button onClick={() => moveItem(b, 'down', brands, 'certification_brands', loadBrands)} disabled={i === brands.length - 1}
                            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg">↓</button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {b.logo_url
                            ? <img src={b.logo_url} alt={b.name} className="w-8 h-8 object-contain rounded" />
                            : <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">{b.name[0]}</div>
                          }
                          <div>
                            <div className="font-semibold text-gray-900">{b.name}</div>
                            {b.description && <div className="text-xs text-gray-400">{b.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleBrand(b)}
                          className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full transition-colors ${b.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {b.published ? 'Publié' : 'Masqué'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => openEditBrand(b)} className="text-blue-600 hover:text-blue-800 font-medium mr-3 text-[12.5px]">Éditer</button>
                        <button onClick={() => removeBrand(b.id)} className="text-red-500 hover:text-red-700 font-medium text-[12.5px]">Suppr.</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
