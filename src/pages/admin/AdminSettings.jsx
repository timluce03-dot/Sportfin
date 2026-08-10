import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const CATEGORIES = [
  { key: 'general',      label: '⚙️  Général',           desc: 'Informations de base du site' },
  { key: 'social',       label: '🔗  Réseaux sociaux',    desc: 'Liens vers vos profils' },
  { key: 'home',         label: '📊  Statistiques accueil', desc: 'Chiffres affichés dans le hero' },
  { key: 'announcement', label: '📣  Bandeau d\'annonce',  desc: 'Bannière informative en haut du site' },
]

function SettingInput({ setting, value, onChange }) {
  if (setting.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={value === 'true'} onChange={e => onChange(e.target.checked ? 'true' : 'false')}
          className="w-4 h-4 accent-blue-600" />
        <span className="text-sm text-gray-700">Activé</span>
      </label>
    )
  }
  if (setting.type === 'color') {
    return (
      <div className="flex items-center gap-3">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          className="form-control max-w-[140px] font-mono text-xs" placeholder="#C9A84C" />
      </div>
    )
  }
  return (
    <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
      className="form-control max-w-lg" />
  )
}

export default function AdminSettings() {
  const [settings, setSettings] = useState([])
  const [values,   setValues]   = useState({})
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  async function load() {
    const { data } = await supabase.from('settings').select('*')
    const map = {}
    ;(data || []).forEach(s => { map[s.key] = s.value || '' })
    setSettings(data || [])
    setValues(map)
  }
  useEffect(() => { load() }, [])

  function handleChange(key, val) {
    setValues(v => ({ ...v, [key]: val }))
    setSaved(false)
  }

  async function saveAll(ev) {
    ev.preventDefault(); setSaving(true)
    await Promise.all(
      Object.entries(values).map(([key, value]) =>
        supabase.from('settings').update({ value }).eq('key', key)
      )
    )
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: settings.filter(s => s.category === cat.key),
  })).filter(cat => cat.items.length > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-gray-900">Paramètres du site</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configuration globale de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
              ✓ Sauvegardé
            </span>
          )}
          <button onClick={saveAll} disabled={saving}
            className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
            {saving ? 'Enregistrement…' : 'Enregistrer tout'}
          </button>
        </div>
      </div>

      {settings.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">
          <div className="text-4xl mb-3">⚙️</div>
          <p className="font-medium">Aucun paramètre</p>
          <p className="text-sm mt-1">Exécutez la migration SQL 002_admin_tables.sql pour initialiser les paramètres.</p>
        </div>
      ) : (
        <form onSubmit={saveAll} className="space-y-5">
          {grouped.map(cat => (
            <div key={cat.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Category header */}
              <div className="px-6 py-4 border-b border-gray-100" style={{ background: '#fafafa' }}>
                <h2 className="font-bold text-gray-900 text-[15px]">{cat.label}</h2>
                {cat.desc && <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>}
              </div>
              {/* Settings rows */}
              <div className="divide-y divide-gray-50">
                {cat.items.map(s => (
                  <div key={s.key} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="sm:w-64 flex-shrink-0">
                      <div className="text-[13.5px] font-semibold text-gray-800">{s.label}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{s.key}</div>
                      {s.description && <div className="text-[11.5px] text-gray-500 mt-0.5">{s.description}</div>}
                    </div>
                    <div className="flex-1">
                      <SettingInput
                        setting={s}
                        value={values[s.key] ?? ''}
                        onChange={val => handleChange(s.key, val)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60">
              {saving ? 'Enregistrement…' : 'Enregistrer tout'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
