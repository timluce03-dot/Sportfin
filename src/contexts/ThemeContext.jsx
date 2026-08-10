import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { loadTheme, applyTheme, saveTheme, DEFAULT_THEME, mergeWithDefaults } from '../lib/theme'
import { supabase } from '../lib/supabase'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Initialise depuis localStorage pour un rendu instantané (pas de flash)
  const [theme, _setTheme] = useState(loadTheme)
  const saveTimer = useRef(null)

  // Applique les variables CSS à chaque changement de thème
  useEffect(() => { applyTheme(theme) }, [theme])

  // Charge le thème depuis Supabase et souscrit aux changements en temps réel
  useEffect(() => {
    supabase
      .from('design_settings')
      .select('theme')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.theme && Object.keys(data.theme).length > 0) {
          const merged = mergeWithDefaults(data.theme)
          _setTheme(merged)
          saveTheme(merged)
        }
      })

    const channel = supabase
      .channel('sf_design_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'design_settings' },
        payload => {
          if (payload.new?.theme && Object.keys(payload.new.theme).length > 0) {
            const merged = mergeWithDefaults(payload.new.theme)
            _setTheme(merged)
            saveTheme(merged)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function persistToDb(t) {
    supabase
      .from('design_settings')
      .upsert({ id: 1, theme: t, updated_at: new Date().toISOString() })
      .then(() => {})
  }

  function setTheme(patch) {
    _setTheme(prev => {
      const next = {
        ...prev, ...patch,
        colors:   { ...prev.colors,   ...patch.colors },
        radius:   { ...prev.radius,   ...patch.radius },
        fonts:    { ...prev.fonts,    ...patch.fonts },
        sections: { ...prev.sections, ...patch.sections },
      }
      saveTheme(next)
      // Sauvegarde en DB après 1,5 s d'inactivité (évite d'écrire à chaque frappe)
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => persistToDb(next), 1500)
      return next
    })
  }

  function resetTheme() {
    saveTheme(DEFAULT_THEME)
    _setTheme(DEFAULT_THEME)
    persistToDb(DEFAULT_THEME)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme, persistToDb }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
