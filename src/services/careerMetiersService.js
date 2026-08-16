import { supabase } from '../lib/supabase'

export async function getCareerMetiers() {
  const { data, error } = await supabase
    .from('career_metiers')
    .select('*')
    .eq('published', true)
    .order('position')
  return { data: data ?? [], error: error?.message ?? null }
}
