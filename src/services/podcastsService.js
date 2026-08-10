import { supabase } from '../lib/supabase'

const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))

export async function getPodcasts({ category } = {}) {
  try {
    let q = supabase.from('podcasts').select('*').eq('published', true).order('published_at', { ascending: false })
    if (category && category !== 'Tous') q = q.eq('category', category)
    const { data, error } = await Promise.race([q, timeout(5000)])
    if (error) return { data: [], error: error.message }
    return { data: data ?? [], error: null }
  } catch (e) {
    return { data: [], error: e.message === 'timeout' ? 'La connexion a pris trop de temps.' : 'Impossible de charger les podcasts.' }
  }
}
