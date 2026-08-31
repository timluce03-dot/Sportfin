import { supabase } from '../lib/supabase'

export async function saveAttempt({ userId, questionId, exerciseId, courseId, chapterId, userAnswer, isCorrect }) {
  if (!userId) return { saved: false }
  const { error } = await supabase.from('exercise_attempts').insert({
    user_id: userId,
    question_id: questionId,
    exercise_id: exerciseId,
    course_id: courseId || null,
    chapter_id: chapterId || null,
    user_answer: typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer),
    is_correct: isCorrect,
  })
  if (error) console.error('saveAttempt error:', error.message)
  return { saved: !error }
}

export async function getExerciseAttempts(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('exercise_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('attempted_at', { ascending: false })
  if (error) console.error('getExerciseAttempts error:', error.message)
  return data ?? []
}

export async function getExerciseResults(userId) {
  if (!userId) return []
  const { data, error } = await supabase
    .from('exercise_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) console.error('getExerciseResults error:', error.message)
  return data ?? []
}

export async function markChapterComplete({ userId, courseId, chapterId }) {
  if (!userId) return
  await supabase.from('course_progress').upsert(
    { user_id: userId, course_id: courseId, chapter_id: chapterId },
    { onConflict: 'user_id,chapter_id' }
  )
}

export async function getCompletedChapters(userId) {
  if (!userId) return []
  const { data } = await supabase
    .from('course_progress')
    .select('chapter_id, course_id, completed_at')
    .eq('user_id', userId)
  return data ?? []
}
