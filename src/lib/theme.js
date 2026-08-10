export const DEFAULT_THEME = {
  colors: {
    primary:   '#0B2545',
    secondary: '#1B4F8A',
    accent:    '#C9A84C',
    button:    '#0B2545',  // couleur dédiée aux boutons (indépendante de primary)
    bg:        '#F7F8FA',
    surface:   '#FFFFFF',
    text:      '#0D1117',
    muted:     '#6B7280',
    border:    '#E8EAED',
  },
  radius: { button: '8px', card: '14px' },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
  },
  cardStyle: 'sobre',    // sobre | premium | compact
  buttonStyle: 'plein',  // plein | contour | minimal
  logo: null,
  heroImage: null,
  sections: {
    showFeatures: true,
    showArticles: true,
    showReviews: true,
    showStats: true,
    order: ['hero', 'features', 'articles'],
  },
}

export function applyTheme(t) {
  const r = document.documentElement.style
  r.setProperty('--sf-primary',     t.colors.primary)
  r.setProperty('--sf-secondary',   t.colors.secondary)
  r.setProperty('--sf-accent',      t.colors.accent)
  r.setProperty('--sf-btn',         t.colors.button || t.colors.primary)
  r.setProperty('--sf-bg',          t.colors.bg)
  r.setProperty('--sf-surface',     t.colors.surface)
  r.setProperty('--sf-text',        t.colors.text)
  r.setProperty('--sf-muted',       t.colors.muted)
  r.setProperty('--sf-border',      t.colors.border)
  r.setProperty('--sf-radius-btn',  t.radius.button)
  r.setProperty('--sf-radius-card', t.radius.card)
  r.setProperty('--sf-font-heading',t.fonts.heading)
  r.setProperty('--sf-font-body',   t.fonts.body)
}

const KEY = 'sf_theme_v2'

export function saveTheme(t) {
  localStorage.setItem(KEY, JSON.stringify(t))
}

export function loadTheme() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_THEME
    const saved = JSON.parse(raw)
    return {
      ...DEFAULT_THEME, ...saved,
      colors:  { ...DEFAULT_THEME.colors,  ...saved.colors },
      radius:  { ...DEFAULT_THEME.radius,  ...saved.radius },
      fonts:   { ...DEFAULT_THEME.fonts,   ...saved.fonts },
      sections:{ ...DEFAULT_THEME.sections,...saved.sections },
    }
  } catch { return DEFAULT_THEME }
}

export function mergeWithDefaults(saved) {
  return {
    ...DEFAULT_THEME, ...saved,
    colors:   { ...DEFAULT_THEME.colors,   ...saved.colors },
    radius:   { ...DEFAULT_THEME.radius,   ...saved.radius },
    fonts:    { ...DEFAULT_THEME.fonts,    ...saved.fonts },
    sections: { ...DEFAULT_THEME.sections, ...saved.sections },
  }
}
