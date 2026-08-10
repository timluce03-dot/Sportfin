import { supabase } from '../lib/supabase'

const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))

export async function getExercises() {
  try {
    const { data, error } = await Promise.race([
      supabase.from('exercises').select('*, chapters(id, title)').eq('published', true).order('position'),
      timeout(5000),
    ])
    if (error) return { data: [], error: error.message }
    return { data: data ?? [], error: null }
  } catch (e) {
    return { data: [], error: 'Impossible de charger les exercices.' }
  }
}

export async function getExerciseQuestions(exerciseId) {
  const { data, error } = await supabase
    .from('exercise_questions')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('position')
  return { data: data ?? [], error: error?.message ?? null }
}

export async function saveExerciseResult({ userId, exerciseId, score, total, answers, timeSeconds }) {
  if (!userId) return { attemptNumber: null, saved: false }
  const { count } = await supabase
    .from('exercise_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
  const attemptNumber = (count ?? 0) + 1
  const { error } = await supabase.from('exercise_results').insert({
    user_id: userId, exercise_id: exerciseId,
    score, total, answers: JSON.stringify(answers),
    time_seconds: timeSeconds, attempt_number: attemptNumber,
  })
  return { attemptNumber, saved: !error }
}

export async function getExerciseHistory(userId, exerciseId) {
  if (!userId) return []
  const { data } = await supabase
    .from('exercise_results')
    .select('score, total, time_seconds, attempt_number, created_at')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: false })
  return data ?? []
}
