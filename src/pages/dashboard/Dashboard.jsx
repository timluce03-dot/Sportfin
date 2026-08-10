import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const MOCK_PROGRESS = [
  { title: 'Droits TV dans le Sport', progress: 85, chapters: 12, done: 10 },
  { title: 'Finance des Clubs Professionnels', progress: 40, chapters: 8, done: 3 },
  { title: 'Sponsoring & Partenariats', progress: 20, chapters: 10, done: 2 },
]

const QUICK_LINKS = [
  { icon: '📚', label: 'Cours', to: '/cours' },
  { icon: '🧠', label: 'Quiz Sport', to: '/quiz' },
  { icon: '🎙️', label: 'Podcasts', to: '/podcasts' },
  { icon: '💼', label: 'Career Center', to: '/career' },
  { icon: '📄', label: 'Articles', to: '/articles' },
  { icon: '🏅', label: 'Certification', to: '/certification' },
]

export default function Dashboard() {
  const { user, profile, loading } = useAuth()
  const [quizResults, setQuizResults] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!user) return
    supabase.from('quiz_results').select('*, quizzes(title)').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setQuizResults(data || []))
  }, [user])

  if (loading) return (
    <div className="pt-[64px] flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
        style={{ borderColor: 'var(--sf-primary)', borderTopColor: 'transparent' }} />
    </div>
  )
  if (!user) return <Navigate to="/profil" replace />

  const name = profile?.full_name || user.email?.split('@')[0] || 'Apprenant'
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <div className="pt-[64px] min-h-screen" style={{ background: 'var(--sf-bg)' }}>
      {/* Hero */}
      <section style={{ background: 'var(--sf-primary)' }} className="px-6 py-10">
        <div className="max-w-[1200px] mx-auto flex items-center gap-5">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              style={{ border: '2px solid rgba(255,255,255,.25)' }} />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold flex-shrink-0"
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>
              {initials}
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-serif text-xl font-extrabold text-white">Bonjour, {name} 👋</h1>
            <p className="text-white/50 text-xs mt-0.5">{profile?.role || 'Apprenant'} · {user.email}</p>
          </div>
          <div className="hidden md:flex gap-8">
            {[['3','Cours en cours'],['85%','Meilleur score'],['12','Quiz complétés']].map(([n,l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-white">{n}</div>
                <div className="text-[10px] text-white/45 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 w-fit shadow-sm" style={{ border: '1px solid var(--sf-border)' }}>
          {[['overview','Vue d\'ensemble'],['courses','Mes cours'],['quiz','Mes quiz']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab===id
                ? { background: 'var(--sf-primary)', color: '#fff' }
                : { color: 'var(--sf-muted)' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Progress */}
            <div className="card p-6">
              <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--sf-text)' }}>Progression des cours</h3>
              <div className="space-y-5">
                {MOCK_PROGRESS.map(c => (
                  <div key={c.title}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium truncate mr-2" style={{ color: 'var(--sf-text)' }}>{c.title}</span>
                      <span className="flex-shrink-0" style={{ color: 'var(--sf-muted)' }}>{c.done}/{c.chapters}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${c.progress}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz results */}
            <div className="card p-6">
              <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--sf-text)' }}>Derniers quiz</h3>
              {quizResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm mb-4" style={{ color: 'var(--sf-muted)' }}>Aucun quiz complété pour l'instant.</p>
                  <Link to="/quiz" className="btn btn-primary btn-sm">Commencer un quiz</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {quizResults.map(r => (
                    <div key={r.id} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--sf-border)' }}>
                      <span className="text-sm" style={{ color: 'var(--sf-text)' }}>{r.quizzes?.title || 'Quiz'}</span>
                      <span className={`text-sm font-bold ${r.score/r.total >= 0.7 ? 'text-emerald-600' : 'text-amber-500'}`}>{r.score}/{r.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="card p-6 md:col-span-2">
              <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--sf-text)' }}>Accès rapide</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {QUICK_LINKS.map(l => (
                  <Link key={l.to} to={l.to}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:shadow-md"
                    style={{ border: '1px solid var(--sf-border)', background: 'var(--sf-bg)' }}>
                    <span className="text-2xl">{l.icon}</span>
                    <span className="text-[11px] font-semibold text-center" style={{ color: 'var(--sf-text)' }}>{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'courses' && (
          <div className="card p-6">
            <h3 className="font-bold text-sm mb-5" style={{ color: 'var(--sf-text)' }}>Mes cours en cours</h3>
            <div className="flex flex-col gap-3">
              {MOCK_PROGRESS.map(c => (
                <div key={c.title} className="flex items-center gap-4 p-4 rounded-xl transition-all"
                  style={{ border: '1px solid var(--sf-border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'var(--sf-primary)' }}>📚</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1.5 truncate" style={{ color: 'var(--sf-text)' }}>{c.title}</div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${c.progress}%` }} /></div>
                    <div className="text-xs mt-1" style={{ color: 'var(--sf-muted)' }}>{c.done} / {c.chapters} chapitres</div>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--sf-primary)' }}>{c.progress}%</span>
                </div>
              ))}
            </div>
            <Link to="/cours" className="btn btn-outline btn-sm mt-5">Découvrir d'autres cours →</Link>
          </div>
        )}

        {tab === 'quiz' && (
          <div className="card p-6">
            <h3 className="font-bold text-sm mb-5" style={{ color: 'var(--sf-text)' }}>Mes résultats de quiz</h3>
            {quizResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🧠</div>
                <p className="text-sm mb-4" style={{ color: 'var(--sf-muted)' }}>Aucun quiz complété. Commencez maintenant !</p>
                <Link to="/quiz" className="btn btn-primary btn-sm">Accéder aux quiz →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {quizResults.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ border: '1px solid var(--sf-border)' }}>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--sf-text)' }}>{r.quizzes?.title || 'Quiz'}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--sf-muted)' }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : ''}</div>
                    </div>
                    <div className={`text-xl font-extrabold ${r.score/r.total >= 0.7 ? 'text-emerald-600' : 'text-amber-500'}`}>{r.score}/{r.total}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
