import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPodcasts } from '../services/podcastsService'

export default function PodcastDetail() {
  const { id } = useParams()
  const [pod,     setPod]     = useState(null)
  const [others,  setOthers]  = useState([])
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true); setError(null)
    getPodcasts().then(({ data, error }) => {
      if (error) {
        setError(error)
      } else {
        setPod(data.find(p => String(p.id) === String(id)) || null)
        setOthers(data.filter(p => String(p.id) !== String(id)).slice(0, 3))
      }
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="pt-[64px] min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
        style={{ borderColor: 'var(--sf-primary)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (error) return (
    <div className="pt-[64px] min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Erreur de chargement</p>
        <p className="text-[13px] mb-5" style={{ color: '#b91c1c' }}>{error}</p>
        <Link to="/podcasts" className="btn btn-primary btn-sm">← Tous les podcasts</Link>
      </div>
    </div>
  )

  if (!pod) return (
    <div className="pt-[64px] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🎙️</div>
        <p className="font-semibold mb-2" style={{ color: 'var(--sf-text)' }}>Podcast introuvable</p>
        <p className="text-[13px] mb-5" style={{ color: 'var(--sf-muted)' }}>Cet épisode n'existe pas ou a été supprimé.</p>
        <Link to="/podcasts" className="btn btn-primary btn-sm">← Tous les podcasts</Link>
      </div>
    </div>
  )

  return (
    <div className="pt-[64px]">
      <section style={{ background: 'var(--sf-primary)' }} className="px-6 py-14">
        <div className="max-w-[900px] mx-auto">
          <Link to="/podcasts" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-xs font-semibold mb-6 transition-colors">
            ← Tous les podcasts
          </Link>
          {pod.category && <span className="badge badge-accent mb-3">{pod.category}</span>}
          <h1 className="font-serif text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-3">{pod.title}</h1>
          <div className="flex flex-wrap items-center gap-5 text-white/55 text-sm">
            {pod.guest     && <span>🎙️ Avec <strong className="text-white/80">{pod.guest}</strong></span>}
            {pod.duration  && <span>⏱ {pod.duration}</span>}
            {pod.published_at && <span>📅 {new Date(pod.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          </div>
        </div>
      </section>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        {pod.youtube_id ? (
          <div className="rounded-2xl overflow-hidden shadow-lg mb-8 aspect-video">
            <iframe
              width="100%" height="100%"
              src={`https://www.youtube-nocookie.com/embed/${pod.youtube_id}`}
              title={pod.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden mb-8 flex items-center justify-center h-[280px]"
            style={{ background: 'linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))' }}>
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎙️</div>
              <p className="font-semibold opacity-70">Vidéo bientôt disponible</p>
            </div>
          </div>
        )}

        {pod.description && (
          <div className="card p-6 mb-8">
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--sf-primary)' }}>À propos de cet épisode</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--sf-muted)' }}>{pod.description}</p>
          </div>
        )}

        {others.length > 0 && (
          <div>
            <h2 className="font-serif text-lg font-bold mb-4" style={{ color: 'var(--sf-text)' }}>Autres épisodes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {others.map(o => (
                <Link key={o.id} to={`/podcasts/${o.id}`} className="card card-hover p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(11,37,69,.07)' }}>🎙️</div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-snug line-clamp-2 mb-1" style={{ color: 'var(--sf-text)' }}>{o.title}</div>
                    <div className="text-[10px]" style={{ color: 'var(--sf-muted)' }}>{o.duration}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
