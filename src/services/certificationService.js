import { supabase } from '../lib/supabase'

const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))

export async function getCertificationLevels() {
  try {
    const { data, error } = await Promise.race([
      supabase.from('certification_levels').select('*').eq('published', true).order('position'),
      timeout(5000),
    ])
    if (error) return { data: [], error: error.message }
    return { data: data ?? [], error: null }
  } catch (e) {
    return { data: [], error: e.message === 'timeout' ? 'La connexion a pris trop de temps.' : 'Impossible de charger les niveaux.' }
  }
}

export async function getCertificationBrands() {
  try {
    const { data, error } = await Promise.race([
      supabase.from('certification_brands').select('*').eq('published', true).order('position'),
      timeout(5000),
    ])
    if (error) return { data: [], error: null } // section non-critique : on passe silencieusement
    return { data: data ?? [], error: null }
  } catch {
    return { data: [], error: null }
  }
}
