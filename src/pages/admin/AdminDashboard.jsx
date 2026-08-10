import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const CARDS = [
  { key: 'courses',    label: 'Cours',        icon: '📚', to: '/admin/courses',       color: '#eff6ff', text: '#1d4ed8' },
  { key: 'chapters',   label: 'Chapitres',    icon: '📑', to: '/admin/chapters',      color: '#f0f9ff', text: '#0369a1' },
  { key: 'exercises',  label: 'Exercices',    icon: '✏️', to: '/admin/exercises',     color: '#eef2ff', text: '#4338ca' },
  { key: 'articles',   label: 'Articles',     icon: '📰', to: '/admin/articles',      color: '#f0fdf4', text: '#15803d' },
  { key: 'quizzes',    label: 'Quiz',         icon: '🧠', to: '/admin/quizzes',       color: '#fffbeb', text: '#b45309' },
  { key: 'jobs',       label: 'Offres',       icon: '💼', to: '/admin/jobs',          color: '#fff1f2', text: '#be123c' },
  { key: 'podcasts',   label: 'Podcasts',     icon: '🎙️', to: '/admin/podcasts',     color: '#faf5ff', text: '#7e22ce' },
  { key: 'reviews',    label: 'Avis',         icon: '⭐', to: '/admin/reviews',       color: '#fefce8', text: '#a16207' },
  { key: 'plans',      label: 'Tarifs',       icon: '💎', to: '/admin/pricing',       color: '#f0fdfa', text: '#0f766e' },
  { key: 'users',      label: 'Utilisateurs', icon: '👥', to: '#',                     color: '#f9fafb', text: '#374151' },
]

const TABLES = {
  courses:   'courses',
  chapters:  'chapters',
  exercises: 'exercises',
  articles:  'articles',
  quizzes:   'quizzes',
  jobs:      'jobs',
  podcasts:  'podcasts',
  reviews:   'reviews',
  plans:     'plans',
  users:     'profiles',
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({})

  useEffect(() => {
    const keys = Object.keys(TABLES)
    Promise.all(
      keys.map(k => supabase.from(TABLES[k]).select('id', { count: 'exact', head: true }))
    ).then(results => {
      const map = {}
      results.forEach((r, i) => { map[keys[i]] = r.count || 0 })
      setCounts(map)
    })
  }, [])

  const QUICK = [
    { to: '/admin/courses',  label: '+ Nouveau cours' },
    { to: '/admin/articles', label: '+ Nouvel article' },
    { to: '/admin/quizzes',  label: '+ Nouveau quiz' },
    { to: '/admin/jobs',     label: '+ Nouvelle offre' },
    { to: '/admin/podcasts', label: '+ Nouvel épisode' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-extrabold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-400 mt-0.5">Vue d'ensemble de la plateforme SportFin</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {CARDS.map(c => (
          <Link key={c.key} to={c.to}
            className="rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5 duration-150"
            style={{ background: c.color }}>
            <div className="text-2xl mb-3">{c.icon}</div>
            <div className="text-3xl font-extrabold leading-none mb-1" style={{ color: c.text }}>
              {counts[c.key] ?? '…'}
            </div>
            <div className="text-xs font-semibold opacity-70" style={{ color: c.text }}>{c.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 text-[15px] mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-2.5">
          {QUICK.map(q => (
            <Link key={q.to} to={q.to} className="btn-primary text-[13px] px-4 py-2">{q.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
