import { supabase } from '../lib/supabase'

export async function getJobs() {
  try {
    const PAGE = 1000
    let all = []
    let from = 0
    while (true) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1)
      if (error) return { data: [], error: error.message }
      if (!data || data.length === 0) break
      all = [...all, ...data]
      if (data.length < PAGE) break
      from += PAGE
    }
    return { data: all, error: null }
  } catch (e) {
    return { data: [], error: 'Impossible de charger les offres.' }
  }
}
