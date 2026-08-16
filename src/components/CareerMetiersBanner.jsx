import { useState, useEffect, useRef } from 'react'
import { getCareerMetiers } from '../services/careerMetiersService'

export default function CareerMetiersBanner() {
  const [metiers,  setMetiers]  = useState([])
  const [selected, setSelected] = useState(null)
  const trackRef = useRef(null)

  useEffect(() => {
    getCareerMetiers().then(({ data }) => setMetiers(data))
  }, [])

  if (metiers.length === 0) return null

  // Duplicate list for seamless infinite scroll
  const items = [...metiers, ...metiers]

  return (
    <>
      <section className="py-10 overflow-hidden" style={{ background: 'var(--sf-surface)' }}>
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 mb-6">
          <h2 className="font-serif text-xl font-extrabold" style={{ color: 'var(--sf-text)' }}>
            Les métiers du Sport Business
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--sf-muted)' }}>
            Découvrez les opportunités qui façonnent l'industrie sportive
          </p>
        </div>

        <div className="relative">
          {/* fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, var(--sf-surface), transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--sf-surface), transparent)' }} />

          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-4 px-4"
              style={{ animation: 'sfScroll 40s linear infinite', width: 'max-content' }}
            >
              {items.map((m, i) => (
                <MetierCard key={`${m.id}-${i}`} metier={m} onSelect={() => setSelected(m)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {selected && <MetierModal metier={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @keyframes sfScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .sf-metier-track:hover { animation-play-state: paused; }
      `}</style>
    </>
  )
}

function MetierCard({ metier, onSelect }) {
  return (
    <div
      className="relative flex-shrink-0 w-44 h-64 rounded-2xl overflow-hidden cursor-pointer group select-none"
      style={{ boxShadow: '0 4px 18px rgba(0,0,0,.13)' }}
      onClick={onSelect}
    >
      {/* portrait background */}
      {metier.photo_url ? (
        <img
          src={metier.photo_url}
          alt={metier.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full" style={{ background: 'var(--sf-primary)' }} />
      )}

      {/* gradient overlay */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,.78) 40%, rgba(0,0,0,.15) 100%)' }} />

      {/* content */}
      <div className="absolute inset-0 flex flex-col justify-end p-3.5">
        <p className="text-white font-bold text-[13px] leading-tight drop-shadow-sm">
          {metier.title}
        </p>
        <button
          onClick={e => { e.stopPropagation(); onSelect() }}
          className="mt-2 text-[11px] font-semibold text-white/80 hover:text-white border border-white/30 hover:border-white/70 rounded-full px-3 py-1 transition-all text-left w-fit"
        >
          Voir plus →
        </button>
      </div>
    </div>
  )
}

function MetierModal({ metier, onClose }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full flex"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* portrait photo side */}
        {metier.photo_url && (
          <div className="w-36 flex-shrink-0 relative hidden sm:block">
            <img src={metier.photo_url} alt={metier.title}
              className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,.15))' }} />
          </div>
        )}

        {/* text side */}
        <div className="flex-1 p-6 overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors text-sm font-bold"
          >✕</button>

          <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: 'var(--sf-primary)' }}>Métier du Sport Business</p>
          <h2 className="font-serif text-lg font-extrabold text-gray-900 leading-snug mb-4">
            {metier.title}
          </h2>

          {metier.description ? (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {metier.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">Aucune description disponible.</p>
          )}
        </div>
      </div>
    </div>
  )
}
