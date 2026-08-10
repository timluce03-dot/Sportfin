import { supabase } from '../lib/supabase'

const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))

export async function getReviews({ limit } = {}) {
  try {
    let q = supabase.from('reviews').select('*').eq('published', true).order('position')
    if (limit) q = q.limit(limit)
    const { data, error } = await Promise.race([q, timeout(5000)])
    if (error) return { data: [], error: error.message }
    return { data: data ?? [], error: null }
  } catch (e) {
    return { data: [], error: e.message === 'timeout' ? 'La connexion a pris trop de temps.' : 'Impossible de charger les avis.' }
  }
}
