import { supabase } from '../lib/supabase'

const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))

export async function getQuizzes() {
  try {
    const { data, error } = await Promise.race([
      supabase.from('quizzes').select('*').eq('published', true).order('id'),
      timeout(5000),
    ])
    if (error) return { data: [], error: error.message }
    return { data: data ?? [], error: null }
  } catch (e) {
    return { data: [], error: e.message === 'timeout' ? 'La connexion a pris trop de temps.' : 'Impossible de charger les quiz.' }
  }
}

export async function getQuizQuestions(quizId) {
  try {
    const { data, error } = await Promise.race([
      supabase.from('quiz_questions').select('*').eq('quiz_id', quizId).order('position'),
      timeout(5000),
    ])
    if (error) return { data: [], error: error.message }
    return { data: data ?? [], error: null }
  } catch (e) {
    return { data: [], error: e.message === 'timeout' ? 'La connexion a pris trop de temps.' : 'Impossible de charger les questions.' }
  }
}

// Returns true if the result was saved (i.e. first attempt), false if already completed
export async function saveQuizResult({ userId, quizId, score, total }) {
  if (!userId) return false
  const { data: existing } = await supabase
    .from('quiz_results')
    .select('id')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .maybeSingle()
  if (existing) return false // first attempt only
  const { error } = await supabase
    .from('quiz_results')
    .insert({ user_id: userId, quiz_id: quizId, score, total })
  return !error
}

export async function getUserResults(userId) {
  if (!userId) return []
  const { data } = await supabase
    .from('quiz_results')
    .select('quiz_id, score, total')
    .eq('user_id', userId)
    .order('id', { ascending: false })
  return data ?? []
}
