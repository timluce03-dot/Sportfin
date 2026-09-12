import { supabase } from '../lib/supabase'

export async function getCaseStudies() {
  const { data, error } = await supabase
    .from('case_studies')
    .select('id, title, subtitle, sector, time_easy, time_intermediate, time_expert, position')
    .eq('published', true)
    .order('position')
  return { data: data ?? [], error: error?.message ?? null }
}

export async function getCaseStudy(id) {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*, case_study_missions(*)')
    .eq('id', id)
    .single()
  if (data?.case_study_missions) {
    data.case_study_missions.sort((a, b) => a.position - b.position)
  }
  return { data, error: error?.message ?? null }
}

export async function getAllCaseStudiesAdmin() {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*, case_study_missions(*)')
    .order('position')
  if (data) data.forEach(cs => cs.case_study_missions?.sort((a, b) => a.position - b.position))
  return { data: data ?? [], error: error?.message ?? null }
}
