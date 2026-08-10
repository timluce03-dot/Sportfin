import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPodcasts } from '../services/podcastsService'

function DurationBadge({ dur }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded"
      style={{ background: 'rgba(0,0,0,.55)', color: '#fff' }}>
      ▶ {dur}
    </span>
  )
}

function PodcastRow({ pod }) {
  return (
    <Link to={`/podcasts/${pod.id}`} className="group flex gap-5 p-4 rounded-2xl transition-all"
      style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sf-shadow-lg)'; e.currentTarget.style.borderColor = 'transparent' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--sf-border)' }}
    >
      <div className="relative w-[140px] h-[88px] flex-shrink-0 rounded-xl overflow-hidden">
        {pod.thumbnail ? (
          <img src={pod.thumbnail} alt={pod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, var(--sf-primary), #163b6b)' }}>
            🎙️
          </div>
        )}
        {pod.duration && <div className="absolute bottom-2 right-2"><DurationBadge dur={pod.duration} /></div>}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(11,37,69,.5)' }}>
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md">
            <span style={{ fontSize: 14, paddingLeft: 2 }}>▶</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2 mb-1.5">
          {pod.category && <span className="badge badge-primary">{pod.category}</span>}
          {pod.published_at && (
            <span className="text-[10.5px]" style={{ color: 'var(--sf-muted)' }}>
              {new Date(pod.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        <h3 className="text-[14px] font-bold leading-snug mb-1" style={{ color: 'var(--sf-text)' }}>{pod.title}</h3>
        {pod.guest && <p className="text-[12.5px] font-semibold mb-1.5" style={{ color: 'var(--sf-accent)' }}>Avec {pod.guest}</p>}
        {pod.description && <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'var(--sf-muted)' }}>{pod.description}</p>}
      </div>

      <div className="flex-shrink-0 self-center text-[18px] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200"
        style={{ color: 'var(--sf-primary)' }}>
        →
      </div>
    </Link>
  )
}

function PodcastCard({ pod }) {
  return (
    <Link to={`/podcasts/${pod.id}`} className="card card-hover group flex flex-col">
      <div className="relative h-44 overflow-hidden">
        {pod.thumbnail ? (
          <img src={pod.thumbnail} alt={pod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: 'linear-gradient(135deg, var(--sf-primary), #163b6b)' }}>
            🎙️
          </div>
        )}
        {pod.duration && <div className="absolute bottom-2.5 right-2.5"><DurationBadge dur={pod.duration} /></div>}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(11,37,69,.48)' }}>
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg">
            <span style={{ fontSize: 18, paddingLeft: 3 }}>▶</span>
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          {pod.category && <span className="badge badge-primary">{pod.category}</span>}
          {pod.published_at && (
            <span className="text-[10px]" style={{ color: 'var(--sf-muted)' }}>
              {new Date(pod.published_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        <h3 className="text-[13.5px] font-bold leading-snug mb-1.5 flex-1" style={{ color: 'var(--sf-text)' }}>{pod.title}</h3>
        {pod.guest && <p className="text-[12px] font-semibold" style={{ color: 'var(--sf-accent)' }}>Avec {pod.guest}</p>}
      </div>
    </Link>
  )
}

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState([])
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [cat,      setCat]      = useState('Tous')
  const [view,     setView]     = useState('list')

  function load() {
    setLoading(true); setError(null)
    getPodcasts().then(({ data, error }) => { setPodcasts(data); setError(error); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const cats     = ['Tous', ...Array.from(new Set(podcasts.map(p => p.category).filter(Boolean)))]
  const filtered = cat === 'Tous' ? podcasts : podcasts.filter(p => p.category === cat)

  return (
    <div className="pt-[64px]" style={{ background: 'var(--sf-bg)' }}>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(155deg, #071a32 0%, var(--sf-primary) 55%, #163b6b 100%)' }} className="px-6 lg:px-10 py-12">
        <div className="max-w-[860px] mx-auto text-center">
          <span className="eyebrow flex justify-center" style={{ color: 'rgba(201,168,76,.8)' }}>Podcasts & Interviews</span>
          <h1 className="font-serif font-extrabold text-white leading-tight mb-3"
            style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}>
            Les voix du <span style={{ color: 'var(--sf-accent)' }}>sport business</span>
          </h1>
          <p className="text-[14px] max-w-lg mx-auto leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,.6)' }}>
            Interviews exclusives de dirigeants, consultants et experts — pour apprendre en écoutant les meilleurs du secteur.
          </p>
          <div className="flex items-center justify-center flex-wrap gap-0">
            {[
              [loading ? '…' : `${podcasts.length}+`, 'Épisodes'],
              [loading ? '…' : `${Math.max(0, cats.length - 1)}`, 'Thèmes'],
              ['5h+', 'de contenu'],
              ['100%', 'Exclusifs'],
            ].map(([n, l], i) => (
              <div key={l} className="flex items-center">
                {i > 0 && <div className="h-6 w-px mx-5" style={{ background: 'rgba(255,255,255,.15)' }} />}
                <div>
                  <div className="font-extrabold text-white text-xl font-serif leading-none">{n}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── List ── */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div className="flex flex-wrap gap-2">
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="pill-filter text-[12.5px]"
                style={cat === c ? { background: 'var(--sf-primary)', color: '#fff', borderColor: 'var(--sf-primary)' } : {}}>
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }}>
            {[['list', '☰'], ['grid', '⊞']].map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)}
                className="w-8 h-7 rounded-lg text-[14px] transition-all"
                style={view === v ? { background: 'var(--sf-primary)', color: '#fff' } : { color: 'var(--sf-muted)' }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-[108px] skeleton rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Erreur de chargement</p>
            <p className="text-[13px] mb-4" style={{ color: '#b91c1c' }}>{error}</p>
            <button onClick={load} className="btn btn-outline btn-sm">Réessayer</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--sf-muted)' }}>
            <div className="text-4xl mb-3">🎙️</div>
            <div className="font-medium">
              {podcasts.length === 0 ? 'Aucun épisode publié pour le moment.' : 'Aucun épisode dans cette catégorie.'}
            </div>
          </div>
        ) : (
          <>
            <p className="text-[12.5px] mb-5" style={{ color: 'var(--sf-muted)' }}>
              {filtered.length} épisode{filtered.length !== 1 ? 's' : ''}{cat !== 'Tous' ? ` · ${cat}` : ''}
            </p>
            {view === 'list' ? (
              <div className="space-y-3">
                {filtered.map(pod => <PodcastRow key={pod.id} pod={pod} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(pod => <PodcastCard key={pod.id} pod={pod} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
