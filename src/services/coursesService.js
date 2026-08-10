import { supabase } from '../lib/supabase'

const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))

export async function getCoursesByModule() {
  try {
    const [{ data: modules, error: modErr }, { data: lessons, error: lesErr }] = await Promise.all([
      Promise.race([supabase.from('courses').select('*').eq('published', true).order('id'), timeout(5000)]),
      Promise.race([supabase.from('chapters').select('*').order('position'), timeout(5000)]),
    ])
    if (modErr) return { data: [], error: modErr.message }
    if (lesErr) return { data: [], error: lesErr.message }
    const grouped = (modules ?? []).map(m => ({
      ...m,
      courses: (lessons ?? []).filter(ch => ch.course_id === m.id),
    }))
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
