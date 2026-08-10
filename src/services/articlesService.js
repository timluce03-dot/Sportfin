import { supabase } from '../lib/supabase'

const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))

export async function getArticles({ limit, category } = {}) {
  let q = supabase
    .from('articles')
    .select('id,title,excerpt,category,cover_url,published_at,author')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (category && category !== 'Tous') q = q.eq('category', category)
  if (limit) q = q.limit(limit)
  try {
    const { data, error } = await Promise.race([q, timeout(5000)])
    if (error) return { data: [], error: error.message }
    return { data: data ?? [], error: null }
  } catch (e) {
    return { data: [], error: e.message === 'timeout' ? 'La connexion a pris trop de temps.' : 'Impossible de charger les articles.' }
  }
}

export async function getArticleById(id) {
  try {
    const { data, error } = await Promise.race([
      supabase.from('articles').select('*').eq('id', id).single(),
      timeout(5000),
    ])
    if (error) return { data: null, error: error.message }
    return { data: data ?? null, error: null }
  } catch (e) {
    return { data: null, error: e.message === 'timeout' ? 'La connexion a pris trop de temps.' : 'Article introuvable.' }
  }
}
