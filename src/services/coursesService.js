import { supabase } from '../lib/supabase'

const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))

// Desired display order for modules (by id)
const MODULE_ORDER = [
  'f2e16161-95d1-4e0c-a8c1-6bb917b9245c', // Les sources de revenus
  'd6394c57-2b53-49cd-824e-972d09467a15', // Finance et comptabilité
  '8d56ebe0-8d38-4abb-a955-1a829595cb12', // Droit & contrats
]

export async function getCoursesByModule() {
  try {
    const [{ data: modules, error: modErr }, { data: lessons, error: lesErr }] = await Promise.all([
      Promise.race([supabase.from('courses').select('*').eq('published', true), timeout(5000)]),
      Promise.race([supabase.from('chapters').select('*').order('position'), timeout(5000)]),
    ])
    if (modErr) return { data: [], error: modErr.message }
    if (lesErr) return { data: [], error: lesErr.message }
    const grouped = (modules ?? []).map(m => ({
      ...m,
      courses: (lessons ?? []).filter(ch => ch.course_id === m.id),
    }))
    grouped.sort((a, b) => {
      const ai = MODULE_ORDER.indexOf(a.id)
      const bi = MODULE_ORDER.indexOf(b.id)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    return { data: grouped, error: null }
  } catch (e) {
    return { data: [], error: 'Impossible de charger les modules.' }
  }
}

export async function getExercises() {
  try {
    const { data, error } = await Promise.race([
      supabase.from('exercises').select('*').eq('published', true).order('position'),
      timeout(5000),
    ])
    if (error) return { data: [], error: error.message }
    return { data: data ?? [], error: null }
  } catch (e) {
    return { data: [], error: e.message === 'timeout' ? 'La connexion a pris trop de temps.' : 'Impossible de charger les exercices.' }
  }
}
