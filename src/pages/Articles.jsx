import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../services/articlesService'
import { getPublications } from '../services/publicationsService'

const CATS = ['Tous', 'Droits TV', 'Finance', 'Sponsoring', 'Stratégie', 'Carrières', 'Investissement', 'Data', 'Sport féminin', 'Billetterie']

const PUB_SERIES = [
  { id: 'le-move',    label: 'Le Move',    color: '#C9A84C', desc: 'Stratégie & Marketing' },
  { id: 'money-time', label: 'Money Time', color: '#10b981', desc: 'Finance & Chiffres' },
  { id: 'top-tier',   label: 'Top Tier',   color: '#8b5cf6', desc: 'Classements' },
]

function ArticleCard({ a, featured }) {
  return (
    <Link
      to={`/articles/${a.id}`}
      className={`card card-hover group flex flex-col ${featured ? 'md:flex-row' : ''}`}
    >
      <div className={`overflow-hidden flex-shrink-0 ${featured ? 'md:w-[260px] h-48 md:h-auto' : 'h-44'}`}>
        {a.cover_url ? (
          <img src={a.cover_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--sf-primary), #163b6b)' }} />
        )}
      </div>
      <div className={`p-4 flex flex-col flex-1 ${featured ? 'md:p-6' : ''}`}>
        <span className="badge badge-primary mb-2">{a.category}</span>
        <h3 className={`font-bold leading-snug mb-2 flex-1 ${featured ? 'text-[17px]' : 'text-[13.5px]'}`}
          style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}>
          {a.title}
        </h3>
        <p className="text-[12px] leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--sf-muted)' }}>{a.excerpt}</p>
        <div className="flex items-center justify-between mt-auto">
          {a.published_at && (
            <span className="text-[11px]" style={{ color: 'var(--sf-muted)' }}>
              {new Date(a.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          <span className="text-[12px] font-semibold flex items-center gap-1 ml-auto" style={{ color: 'var(--sf-accent)' }}>
            Lire <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ── Publication Carousel ── */
function PubCarousel({ pub, color }) {
  const [cardIdx, setCardIdx] = useState(0)
  const imgs = pub.images || []
  const total = imgs.length

  function prev() { setCardIdx(i => (i - 1 + total) % total) }
  function next() { setCardIdx(i => (i + 1) % total) }

  useEffect(() => { setCardIdx(0) }, [pub.id])

  if (!total) return null
  return (
    <div className="flex flex-col items-center">
      {/* Card image */}
      <div className="relative select-none" style={{ width: '100%', maxWidth: 340 }}>
        <img
          src={imgs[cardIdx]}
          alt={`Carte ${cardIdx + 1}`}
          draggable={false}
          className="w-full rounded-2xl shadow-2xl object-cover"
          style={{ aspectRatio: '4/5', display: 'block' }}
        />
        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute top-1/2 -translate-y-1/2 -left-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 18 }}
              aria-label="Carte précédente">
              ‹
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 -translate-y-1/2 -right-5 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 18 }}
              aria-label="Carte suivante">
              ›
            </button>
          </>
        )}
        {/* Counter badge */}
        <div className="absolute bottom-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
          {cardIdx + 1} / {total}
        </div>
      </div>
      {/* Dot indicators */}
      {total > 1 && total <= 12 && (
        <div className="flex gap-1.5 mt-3">
          {imgs.map((_, i) => (
            <button key={i} onClick={() => setCardIdx(i)}
              className="rounded-full transition-all"
              style={{
                width: i === cardIdx ? 20 : 6,
                height: 6,
                background: i === cardIdx ? color : 'rgba(255,255,255,0.3)',
              }} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Publications Section ── */
function PublicationsSection() {
  const [pubs,     setPubs]    = useState([])
  const [series,   setSeries]  = useState('le-move')
  const [pubIdx,   setPubIdx]  = useState(0)
  const [loading,  setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPublications().then(({ data }) => {
      setPubs(data || [])
      setLoading(false)
    })
  }, [])

  const seriesMeta = PUB_SERIES.find(s => s.id === series)
  const filtered   = pubs.filter(p => p.series === series)
  const current    = filtered[pubIdx] || null

  function pickSeries(id) { setSeries(id); setPubIdx(0) }

  const hasPubs = PUB_SERIES.some(s => pubs.some(p => p.series === s.id))

  return (
    <section style={{ background: '#0B2545' }} className="py-12 px-6 lg:px-10">
      <div className="max-w-[1360px] mx-auto">

        {/* Section header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(201,168,76,0.8)' }}>
            Publications
          </span>
          <h2 className="font-serif font-extrabold text-white mt-1" style={{ fontSize: 'clamp(22px, 2.5vw, 32px)' }}>
            Nos séries Instagram
          </h2>
          <p className="text-[13px] mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Stratégie, finance et classements — en cartes à lire carte par carte
          </p>
        </div>

        {/* Series tabs */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {PUB_SERIES.map(s => {
            const hasContent = pubs.some(p => p.series === s.id)
            return (
              <button key={s.id} onClick={() => pickSeries(s.id)} disabled={!hasContent}
                className="px-5 py-2.5 rounded-full text-[13px] font-bold transition-all disabled:opacity-30"
                style={series === s.id
                  ? { background: s.color, color: '#fff', boxShadow: `0 0 20px ${s.color}55` }
                  : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', border: `1px solid rgba(255,255,255,0.1)` }
                }>
                {s.label}
                <span className="ml-1.5 text-[10px] font-normal opacity-70">{s.desc}</span>
              </button>
            )
          })}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: seriesMeta?.color, borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Aucune publication pour cette série.
          </p>
        )}

        {!loading && filtered.length > 0 && current && (
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

            {/* Main carousel */}
            <div className="w-full lg:w-auto flex-shrink-0 flex justify-center px-6 lg:px-0"
              style={{ maxWidth: 400 }}>
              <PubCarousel pub={current} color={seriesMeta.color} />
            </div>

            {/* Publication thumbnails (right side on desktop, bottom on mobile) */}
            {filtered.length > 1 && (
              <div className="w-full lg:w-auto lg:max-w-xs">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {filtered.length} publication{filtered.length > 1 ? 's' : ''} dans cette série
                </p>
                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0"
                  style={{ maxHeight: 'none' }}>
                  {filtered.map((p, i) => (
                    <button key={p.id} onClick={() => setPubIdx(i)}
                      className="flex-shrink-0 flex items-center gap-3 rounded-xl p-2 transition-all text-left w-full"
                      style={pubIdx === i
                        ? { background: `${seriesMeta.color}20`, border: `1px solid ${seriesMeta.color}50` }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                      }>
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt="" className="rounded-lg object-cover flex-shrink-0"
                          style={{ width: 48, height: 60 }} />
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

export default function Articles() {
  const [articles, setArticles] = useState([])
  const [error,    setError]    = useState(null)
  const [cat,      setCat]      = useState('Tous')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getArticles({ category: cat }).then(({ data, error }) => {
      setArticles(data)
      setError(error)
      setLoading(false)
    })
  }, [cat])

  const featured = articles[0]
  const rest     = articles.slice(1)

  return (
    <div className="pt-[64px]">

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(155deg, #071a32 0%, var(--sf-primary) 55%, #163b6b 100%)' }} className="px-6 lg:px-10 py-12">
        <div className="max-w-[860px] mx-auto text-center">
          <span className="eyebrow flex justify-center" style={{ color: 'rgba(201,168,76,.8)' }}>
            Actualité &amp; analyses
          </span>
          <h1 className="font-serif font-extrabold text-white mb-3 leading-tight"
            style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}>
            L'<span style={{ color: 'var(--sf-accent)' }}>Économie</span> du sport décryptée
          </h1>
          <p className="text-[14px] max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            Analyses, décryptages et tribunes sur les enjeux financiers, stratégiques et juridiques du sport professionnel.
          </p>
        </div>
      </section>

      {/* ── Grandes Analyses ── */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">

        <div className="flex flex-wrap gap-2 mb-8">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="pill-filter text-[12.5px]"
              style={cat === c ? { background: 'var(--sf-primary)', color: '#fff', borderColor: 'var(--sf-primary)' } : {}}>
              {c}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 skeleton rounded-2xl" />)}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Erreur de chargement</p>
            <p className="text-[13px] mb-5" style={{ color: '#b91c1c' }}>{error}</p>
            <button
              onClick={() => { setLoading(true); setError(null); getArticles({ category: cat }).then(({ data, error }) => { setArticles(data); setError(error); setLoading(false) }) }}
              className="btn btn-outline btn-sm">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📰</div>
            <p className="font-semibold text-[15px] mb-1" style={{ color: 'var(--sf-text)' }}>
              {cat === 'Tous' ? 'Aucun article publié pour le moment' : 'Aucun article dans cette catégorie'}
            </p>
            <p className="text-[13px]" style={{ color: 'var(--sf-muted)' }}>
              {cat === 'Tous' ? 'Revenez bientôt.' : 'Essayez une autre catégorie ou revenez bientôt.'}
            </p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <>
            {featured && (
              <div className="mb-8">
                <ArticleCard a={featured} featured />
              </div>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map(a => <ArticleCard key={a.id} a={a} />)}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Publications Instagram ── */}
      <PublicationsSection />

    </div>
  )
}
