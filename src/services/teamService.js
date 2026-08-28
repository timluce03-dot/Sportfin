import { supabase } from '../lib/supabase'

export async function getTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('published', true)
    .order('position')
  return { data: data ?? [], error: error?.message ?? null }
}
