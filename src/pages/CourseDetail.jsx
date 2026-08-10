import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('courses').select('*').eq('id', id).single(),
      supabase.from('chapters').select('*').eq('course_id', id).order('position'),
    ]).then(([{ data: c }, { data: ch }]) => {
      setCourse(c)
      setChapters(ch || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="pt-[64px] flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
        style={{ borderColor: 'var(--sf-primary)', borderTopColor: 'transparent' }} />
    </div>
  )
  if (!course) return (
    <div className="pt-[64px] text-center py-20">
      <p className="text-sm mb-4" style={{ color: 'var(--sf-muted)' }}>Cours introuvable.</p>
      <Link to="/cours" className="btn btn-primary btn-sm">← Retour aux cours</Link>
    </div>
  )

  return (
    <div className="pt-[64px]">
      {/* Hero */}
      <section style={{ background: 'var(--sf-primary)' }} className="px-6 py-14">
        <div className="max-w-[900px] mx-auto">
          <Link to="/cours" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs font-semibold mb-6 transition-colors">
            ← Retour aux cours
          </Link>
          <div className="flex items-center gap-2 mb-3">
            {course.is_premium
              ? <span className="badge badge-accent">Premium</span>
              : <span className="badge badge-success">Gratuit</span>}
            {course.level && <span className="text-white/50 text-xs">{course.level}</span>}
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-3">{course.title}</h1>
          <p className="text-white/65 max-w-xl leading-relaxed">{course.description}</p>
          {(course.duration || chapters.length > 0) && (
            <p className="text-white/40 text-xs mt-4">
              {course.duration && `⏱ ${course.duration} · `}{chapters.length} chapitre{chapters.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        <h2 className="font-serif text-xl font-bold mb-6" style={{ color: 'var(--sf-text)' }}>Contenu du cours</h2>
        {chapters.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--sf-muted)' }}>Aucun chapitre disponible pour l'instant.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {chapters.map((ch, i) => {
              const locked = ch.is_premium && !user
              return (
                <div key={ch.id}
                  className={`card flex items-center gap-4 px-5 py-4 transition-all ${locked ? 'opacity-60' : 'card-hover cursor-pointer'}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={locked
                      ? { background: 'rgba(0,0,0,.06)', color: 'var(--sf-muted)' }
                      : { background: 'rgba(11,37,69,.08)', color: 'var(--sf-primary)' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-snug" style={{ color: 'var(--sf-text)' }}>{ch.title}</div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs" style={{ color: 'var(--sf-muted)' }}>
                      {ch.duration && <span>⏱ {ch.duration}</span>}
                      {ch.type && <span className="capitalize">{ch.type}</span>}
                    </div>
                  </div>
                  <span className="text-sm flex-shrink-0" style={{ color: 'var(--sf-muted)' }}>{locked ? '🔒' : '→'}</span>
                </div>
              )
            })}
          </div>
        )}

        {course.is_premium && !user && (
          <div className="mt-8 rounded-2xl p-8 text-center text-white" style={{ background: 'var(--sf-primary)' }}>
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-serif text-xl font-bold mb-2">Contenu Premium</h3>
            <p className="text-white/70 mb-5 text-sm">Créez un compte gratuit ou souscrivez pour accéder à tous les chapitres.</p>
            <Link to="/tarifs" className="btn btn-accent">Voir les offres →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
