import { supabase } from '../lib/supabase'

export async function getPublications({ series } = {}) {
  let q = supabase.from('publications').select('*').eq('published', true).order('position').order('created_at', { ascending: false })
  if (series) q = q.eq('series', series)
  const { data, error } = await q
  return { data: data ?? [], error: error?.message ?? null }
}

export async function getAllPublications() {
  const { data, error } = await supabase.from('publications').select('*').order('position').order('created_at', { ascending: false })
  return { data: data ?? [], error: error?.message ?? null }
}

export async function upsertPublication(payload, id) {
  const { data, error } = id
    ? await supabase.from('publications').update(payload).eq('id', id).select().single()
    : await supabase.from('publications').insert(payload).select().single()
  return { data, error: error?.message ?? null }
}

export async function deletePublication(id) {
  const { error } = await supabase.from('publications').delete().eq('id', id)
  return { error: error?.message ?? null }
}
