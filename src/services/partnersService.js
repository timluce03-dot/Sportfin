import { supabase } from '../lib/supabase'

export async function getPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('published', true)
    .order('position')
  return { data: data ?? [], error: error?.message ?? null }
}
