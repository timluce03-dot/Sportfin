import { useRef, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const CARD_STYLES   = ['sobre', 'premium', 'compact']
const BUTTON_STYLES = ['plein', 'contour', 'minimal']
const FONT_HEADINGS = [
  "'Playfair Display', serif",
  "'Montserrat', sans-serif",
  "'DM Serif Display', serif",
  "'Inter', sans-serif",
]
const FONT_BODIES = [
  "'Inter', sans-serif",
  "'DM Sans', sans-serif",
  "'Nunito', sans-serif",
  "'Source Sans 3', sans-serif",
]

// Sections ordonnables (hero est toujours en premier et non déplaçable)
const ORDERABLE = {
  features: { label: 'Bande fonctionnalités', showKey: 'showFeatures' },
  articles: { label: 'Grille articles',        showKey: 'showArticles' },
}

function ColorRow({ label, tokenKey, value, onChange, note }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: '#e5e7eb' }}>
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {note
          ? <div className="text-[10.5px] text-gray-400">{note}</div>
          : <div className="text-xs text-gray-400 font-mono">--sf-{tokenKey}</div>
        }
      </div>
      <div className="flex items-center gap-3">
        <input type="color" value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5"
        />
        <input type="text" value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-24 text-xs font-mono px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none"
        />
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${checked ? 'bg-emerald-500' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-5' : 'left-1'}`} />
    </button>
  )
}

export default function AdminDesign() {
  const { theme, setTheme, resetTheme } = useTheme()
  const [saved, setSaved] = useState(false)
  const statusTimer = useRef(null)

  function handleChange(patch) {
    setTheme(patch)
    setSaved(false)
    clearTimeout(statusTimer.current)
    statusTimer.current = setTimeout(() => setSaved(true), 2000)
  }

  function handleColorChange(tokenKey, val) {
    handleChange({ colors: { [tokenKey]: val } })
  }

  const sectionOrder = (theme.sections?.order || ['hero', 'features', 'articles'])
    .filter(k => k !== 'hero')

  function moveSection(i, dir) {
    const j = i + dir
    if (j < 0 || j >= sectionOrder.length) return
    const newOrder = [...sectionOrder]
    ;[newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]]
    handleChange({ sections: { order: ['hero', ...newOrder] } })
  }

  function handleReset() {
    if (!confirm('Réinitialiser le thème SportFin par défaut ? Cette action écrasera toutes vos personnalisations.')) return
    resetTheme()
    setSaved(true)
    clearTimeout(statusTimer.current)
    statusTimer.current = setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design & Apparence</h1>
          <p className="text-sm text-gray-500 mt-1">
            Personnalisez le thème visuel de toute la plateforme.
            Les changements sont appliqués en temps réel sur le site public.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-[12px] font-semibold text-emerald-600 flex items-center gap-1">
              <span className="text-[15px]">✓</span> Sauvegardé
            </span>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ↺ Réinitialiser le thème par défaut
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">

          {/* Colors */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-1">Couleurs</h2>
            <p className="text-xs text-gray-400 mb-4">Ces valeurs alimentent les variables CSS <code className="bg-gray-100 px-1 rounded">--sf-*</code> utilisées sur tout le site.</p>
            <ColorRow label="Couleur principale"  tokenKey="primary"   value={theme.colors.primary}   onChange={v => handleColorChange('primary', v)} />
            <ColorRow label="Couleur secondaire"  tokenKey="secondary" value={theme.colors.secondary} onChange={v => handleColorChange('secondary', v)} />
            <ColorRow label="Accent / or"         tokenKey="accent"    value={theme.colors.accent}    onChange={v => handleColorChange('accent', v)} />
            <ColorRow
              label="Couleur des boutons"
              tokenKey="btn"
              value={theme.colors.button}
              onChange={v => handleColorChange('button', v)}
              note="Indépendant de la couleur principale"
            />
            <ColorRow label="Fond général"        tokenKey="bg"        value={theme.colors.bg}        onChange={v => handleColorChange('bg', v)} />
            <ColorRow label="Surface / cartes"    tokenKey="surface"   value={theme.colors.surface}   onChange={v => handleColorChange('surface', v)} />
            <ColorRow label="Texte principal"     tokenKey="text"      value={theme.colors.text}      onChange={v => handleColorChange('text', v)} />
            <ColorRow label="Texte atténué"       tokenKey="muted"     value={theme.colors.muted}     onChange={v => handleColorChange('muted', v)} />
            <ColorRow label="Bordures"            tokenKey="border"    value={theme.colors.border}    onChange={v => handleColorChange('border', v)} />
          </div>

          {/* Typography */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Typographie</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Police titres</label>
                <select value={theme.fonts.heading}
                  onChange={e => handleChange({ fonts: { heading: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
                  {FONT_HEADINGS.map(f => <option key={f} value={f}>{f.split(',')[0].replace(/'/g, '')}</option>)}
                </select>
                <p className="mt-2 text-base" style={{ fontFamily: theme.fonts.heading }}>L'économie du sport professionnel</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Police corps</label>
                <select value={theme.fonts.body}
                  onChange={e => handleChange({ fonts: { body: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white">
                  {FONT_BODIES.map(f => <option key={f} value={f}>{f.split(',')[0].replace(/'/g, '')}</option>)}
                </select>
                <p className="mt-2 text-sm" style={{ fontFamily: theme.fonts.body }}>Des formations pour les professionnels du sport business.</p>
              </div>
            </div>
          </div>

          {/* Radius */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Arrondis</h2>
            <div className="grid grid-cols-2 gap-5">
              {[['Boutons', 'button'], ['Cartes', 'card']].map(([label, key]) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">{label}</label>
                  <input type="range" min="0" max="24" step="2"
                    value={parseInt(theme.radius[key] || '8')}
                    onChange={e => handleChange({ radius: { [key]: `${e.target.value}px` } })}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-400 font-mono mt-1">{theme.radius[key]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card & Button style */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Styles des composants</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">Style des cartes de cours</label>
                <div className="flex gap-2">
                  {CARD_STYLES.map(s => (
                    <button key={s} onClick={() => handleChange({ cardStyle: s })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${theme.cardStyle === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">Style des boutons</label>
                <div className="flex gap-2">
                  {BUTTON_STYLES.map(s => (
                    <button key={s} onClick={() => handleChange({ buttonStyle: s })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${theme.buttonStyle === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">Médias</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">URL du logo</label>
                <input type="url" value={theme.logo || ''} placeholder="https://…"
                  onChange={e => handleChange({ logo: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Image hero (overlay)</label>
                <input type="url" value={theme.heroImage || ''} placeholder="https://…"
                  onChange={e => handleChange({ heroImage: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Sections de la home */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-1">Sections de la page d'accueil</h2>
            <p className="text-xs text-gray-400 mb-5">
              Activez/désactivez les blocs et réordonnez-les avec les flèches.
              Le hero est toujours en première position.
            </p>

            {/* Statistiques hero (toggle simple, pas ordonnables) */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-800">Statistiques hero</div>
                <div className="text-xs text-gray-400">Chiffres clés sous les boutons CTA</div>
              </div>
              <Toggle
                checked={theme.sections?.showStats !== false}
                onChange={v => handleChange({ sections: { showStats: v } })}
              />
            </div>

            {/* Sections ordonnables */}
            <div className="mt-3 space-y-1">
              {sectionOrder.map((key, i) => {
                const def = ORDERABLE[key]
                if (!def) return null
                const showKey = def.showKey
                const isVisible = theme.sections?.[showKey] !== false
                return (
                  <div key={key}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-gray-100 bg-gray-50">
                    {/* Ordre */}
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => moveSection(i, -1)}
                        disabled={i === 0}
                        className="w-6 h-5 rounded flex items-center justify-center text-[11px] font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-default transition-colors"
                      >↑</button>
                      <button
                        onClick={() => moveSection(i, 1)}
                        disabled={i === sectionOrder.length - 1}
                        className="w-6 h-5 rounded flex items-center justify-center text-[11px] font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-default transition-colors"
                      >↓</button>
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{def.label}</div>
                      <div className="text-[10.5px] text-gray-400 font-mono">{key}</div>
                    </div>

                    {/* Toggle visible */}
                    <Toggle
                      checked={isVisible}
                      onChange={v => handleChange({ sections: { [showKey]: v } })}
                    />
                  </div>
                )
              })}
            </div>

            {/* Avis (sous-section de articles) */}
            <div className="flex items-center justify-between py-3 mt-2 pl-10">
              <div>
                <div className="text-sm font-medium text-gray-700">↳ Sidebar avis</div>
                <div className="text-xs text-gray-400">Colonne avis à droite des articles</div>
              </div>
              <Toggle
                checked={theme.sections?.showReviews !== false}
                onChange={v => handleChange({ sections: { showReviews: v } })}
              />
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="sticky top-[80px] h-fit">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Aperçu en direct</h2>
              <a href="/" target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline font-medium">
                Voir le site ↗
              </a>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              {/* Mini hero */}
              <div className="p-5 text-white" style={{ background: 'var(--sf-primary)' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1.5">SPORTFIN</div>
                <div className="text-sm font-bold leading-snug mb-3" style={{ fontFamily: 'var(--sf-font-heading)' }}>
                  La plateforme n°1 du sport business
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
                    style={{ background: 'var(--sf-btn)', borderRadius: 'var(--sf-radius-btn)', filter: 'brightness(1.2)' }}>
                    Commencer
                  </div>
                  <div className="px-3 py-1.5 text-[10px] font-bold border border-white/30 text-white"
                    style={{ borderRadius: 'var(--sf-radius-btn)' }}>
                    En savoir plus
                  </div>
                </div>
              </div>
              {/* Mini card */}
              <div className="p-4" style={{ background: 'var(--sf-bg)' }}>
                <div className="p-3 shadow-sm" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius-card)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--sf-muted)' }}>Finance</div>
                  <div className="text-xs font-bold mb-1" style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-body)' }}>Finance des clubs pro</div>
                  <div className="text-[10px]" style={{ color: 'var(--sf-muted)' }}>6 chapitres · Gratuit</div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Principale</span>
                <span className="font-mono flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ background: theme.colors.primary }} />
                  {theme.colors.primary}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Boutons</span>
                <span className="font-mono flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ background: theme.colors.button || theme.colors.primary }} />
                  {theme.colors.button || theme.colors.primary}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Accent</span>
                <span className="font-mono flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ background: theme.colors.accent }} />
                  {theme.colors.accent}
                </span>
              </div>
              <div className="flex justify-between"><span>Arrondi card</span><span className="font-mono">{theme.radius.card}</span></div>
              <div className="flex justify-between"><span>Police titre</span><span className="font-mono truncate max-w-[140px]">{theme.fonts.heading.split(',')[0].replace(/'/g, '')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
