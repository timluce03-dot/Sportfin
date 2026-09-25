import { useState, useEffect } from 'react'
import { getPublications } from '../services/publicationsService'

const PUB_SERIES = [
  { id: 'le-move',    label: 'Le Move',    color: '#C9A84C', desc: 'Stratégie & Marketing' },
  { id: 'money-time', label: 'Money Time', color: '#10b981', desc: 'Finance & Chiffres' },
  { id: 'top-tier',   label: 'Top Tier',   color: '#8b5cf6', desc: 'Classements' },
]

function PubCarousel({ pub, color }) {
  const [cardIdx, setCardIdx] = useState(0)
  const imgs = pub.images || []
  const total = imgs.length

  useEffect(() => { setCardIdx(0) }, [pub.id])

  if (!total) return null
  return (
    <div className="flex flex-col items-center">
      <div className="relative select-none" style={{ width: '100%', maxWidth: 300 }}>
        <img
          src={imgs[cardIdx]}
          alt={`Carte ${cardIdx + 1}`}
          draggable={false}
          className="w-full rounded-2xl shadow-2xl object-cover"
          style={{ aspectRatio: '4/5', display: 'block' }}
        />
        {total > 1 && (
          <>
            <button
              onClick={() => setCardIdx(i => (i - 1 + total) % total)}
              className="absolute top-1/2 -translate-y-1/2 -left-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 18 }}
              aria-label="Carte précédente">‹</button>
            <button
              onClick={() => setCardIdx(i => (i + 1) % total)}
              className="absolute top-1/2 -translate-y-1/2 -right-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 18 }}
              aria-label="Carte suivante">›</button>
          </>
        )}
        <div className="absolute bottom-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
          {cardIdx + 1} / {total}
        </div>
      </div>
      {total > 1 && total <= 12 && (
        <div className="flex gap-1.5 mt-3">
          {imgs.map((_, i) => (
            <button key={i} onClick={() => setCardIdx(i)}
              className="rounded-full transition-all"
              style={{ width: i === cardIdx ? 20 : 6, height: 6, background: i === cardIdx ? color : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

/* compact=true → version plus petite pour la home page */
export default function PublicationsSection({ compact = false }) {
  const [pubs,    setPubs]    = useState([])
  const [series,  setSeries]  = useState('le-move')
  const [pubIdx,  setPubIdx]  = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublications().then(({ data }) => {
      setPubs(data || [])
      setLoading(false)
    })
  }, [])

  const seriesMeta = PUB_SERIES.find(s => s.id === series)
  const filtered   = pubs.filter(p => p.series === series)
  const current    = filtered[pubIdx] || null
  const hasPubs    = PUB_SERIES.some(s => pubs.some(p => p.series === s.id))

  if (!loading && !hasPubs) return null

  const py = compact ? 'py-8' : 'py-12'

  return (
    <section style={{ background: '#0B2545' }} className={`${py} px-6 lg:px-10`}>
      <div className="max-w-[1360px] mx-auto">

        {/* Header */}
        <div className={`text-center ${compact ? 'mb-5' : 'mb-8'}`}>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.8)' }}>
            Publications
          </span>
          <h2 className="font-serif font-extrabold text-white mt-1"
            style={{ fontSize: compact ? 'clamp(18px, 2vw, 24px)' : 'clamp(22px, 2.5vw, 32px)' }}>
            Nos séries Instagram
          </h2>
          {!compact && (
            <p className="text-[13px] mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Stratégie, finance et classements — en cartes à lire carte par carte
            </p>
          )}
        </div>

        {/* Series tabs */}
        <div className={`flex justify-center gap-3 ${compact ? 'mb-5' : 'mb-8'} flex-wrap`}>
          {PUB_SERIES.map(s => {
            const hasContent = pubs.some(p => p.series === s.id)
            return (
              <button key={s.id} onClick={() => { setSeries(s.id); setPubIdx(0) }} disabled={!hasContent}
                className="px-4 py-2 rounded-full text-[12.5px] font-bold transition-all disabled:opacity-30"
                style={series === s.id
                  ? { background: s.color, color: '#fff', boxShadow: `0 0 16px ${s.color}55` }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.1)' }
                }>
                {s.label}
                {!compact && <span className="ml-1.5 text-[10px] font-normal opacity-70">{s.desc}</span>}
              </button>
            )
          })}
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: seriesMeta?.color, borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center py-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Aucune publication pour cette série.
          </p>
        )}

        {!loading && filtered.length > 0 && current && (
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            <div className="w-full lg:w-auto flex-shrink-0 flex justify-center px-6 lg:px-0"
              style={{ maxWidth: compact ? 340 : 400 }}>
              <PubCarousel pub={current} color={seriesMeta.color} />
            </div>
            {filtered.length > 1 && (
              <div className="w-full lg:w-auto lg:max-w-xs">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {filtered.length} publication{filtered.length > 1 ? 's' : ''} dans cette série
                </p>
                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                  {filtered.map((p, i) => (
                    <button key={p.id} onClick={() => setPubIdx(i)}
                      className="flex-shrink-0 flex items-center gap-3 rounded-xl p-2 transition-all text-left w-full"
                      style={pubIdx === i
                        ? { background: `${seriesMeta.color}20`, border: `1px solid ${seriesMeta.color}50` }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                      }>
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt="" className="rounded-lg object-cover flex-shrink-0"
                          style={{ width: 44, height: 55 }} />
                      )}
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold truncate"
                          style={{ color: pubIdx === i ? seriesMeta.color : 'rgba(255,255,255,0.7)' }}>
                          Publication {i + 1}
                        </p>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {p.images?.length || 0} carte{p.images?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
