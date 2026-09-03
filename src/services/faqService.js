import { supabase } from '../lib/supabase'

export async function getFaq() {
  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .eq('published', true)
    .order('position')
  return { data: data ?? [], error: error?.message ?? null }
}
