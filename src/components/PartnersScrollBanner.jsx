import { useEffect, useState } from 'react'
import { getPartners } from '../services/partnersService'

export default function PartnersScrollBanner({ title = 'Ils reconnaissent SportFin' }) {
  const [partners, setPartners] = useState([])

  useEffect(() => {
    getPartners().then(({ data }) => setPartners(data))
  }, [])

  if (partners.length === 0) return null

  // Duplicate for seamless infinite loop
  const items = [...partners, ...partners, ...partners]

  return (
    <div className="border-y overflow-hidden" style={{
      borderColor: 'var(--sf-border)',
      background: 'var(--sf-surface)',
    }}>
      {title && (
        <p className="text-center text-[10px] font-bold tracking-[0.15em] uppercase pt-4 pb-2"
          style={{ color: 'var(--sf-muted)' }}>
          {title}
        </p>
      )}

      <div className="relative py-4 overflow-hidden">
        {/* fade gauche */}
        <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--sf-surface), transparent)' }} />
        {/* fade droite */}
        <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--sf-surface), transparent)' }} />

        <div className="flex items-center partners-track" style={{ width: 'max-content' }}>
          {items.map((p, i) => (
            <div key={i} className="flex-shrink-0 mx-8 flex items-center gap-3">
              {p.logo_url ? (
                <a href={p.website_url || '#'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity">
                  <img src={p.logo_url} alt={p.name}
                    className="h-8 w-auto object-contain"
                    style={{ maxWidth: 120 }} />
                </a>
              ) : (
                <span className="text-[13px] font-bold whitespace-nowrap opacity-50"
                  style={{ color: 'var(--sf-text)' }}>
                  {p.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .partners-track {
          animation: partners-scroll 30s linear infinite;
        }
        .partners-track:hover {
          animation-play-state: paused;
        }
        @keyframes partners-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
