import { supabase } from '../lib/supabase'

export async function getFiches() {
  const { data, error } = await supabase
    .from('fiches')
    .select('*')
    .eq('published', true)
    .order('position')
  return { data: data ?? [], error: error?.message ?? null }
}

export async function getFiche(id) {
  const { data, error } = await supabase
    .from('fiches')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error: error?.message ?? null }
}
