import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { getArticles } from '../services/articlesService'
import { getReviews } from '../services/reviewsService'

const FEATURES = [
  { icon: '📚', label: 'Cours & Exercices',    desc: 'Finance, stratégie, droits TV' },
  { icon: '🧠', label: 'Quiz gamifiés',         desc: 'Classements, XP, badges' },
  { icon: '🎙️', label: 'Podcasts & Interviews', desc: 'Pros du secteur en exclusivité' },
  { icon: '💼', label: 'Career Center',         desc: 'Offres sport business triées' },
  { icon: '🏅', label: 'Certification',         desc: 'Badge LinkedIn officiel SBM' },
  { icon: '📄', label: 'Articles & Actualité',  desc: 'Économie du sport décryptée' },
  { icon: '✏️', label: 'Cas pratiques',         desc: 'Exercices corrigés par experts' },
  { icon: '📊', label: 'Fiches de révision',    desc: 'Condensés clés en main' },
]

function ArticleCard({ a }) {
  return (
    <Link to={`/articles/${a.id}`} className="card card-hover group flex flex-col">
      <div className="h-44 overflow-hidden flex-shrink-0">
        {a.cover_url
          ? <img src={a.cover_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--sf-primary), var(--sf-secondary))' }} />
        }
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="badge badge-primary mb-2">{a.category}</span>
        <h3 className="text-[13.5px] font-bold leading-snug mb-2 flex-1"
          style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}>{a.title}</h3>
        <p className="text-[12px] leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--sf-muted)' }}>{a.excerpt}</p>
        <span className="text-[12px] font-semibold flex items-center gap-1" style={{ color: 'var(--sf-accent)' }}>
          Lire l'article <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
        </span>
      </div>
    </Link>
  )
}

function ReviewCard({ r }) {
  const name    = r.name || r.author || '?'
  const avatar  = r.avatar
  const initials= name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-5 rounded-2xl border flex flex-col gap-4" style={{ background: 'var(--sf-surface)', borderColor: 'var(--sf-border)', boxShadow: 'var(--sf-shadow-xs)' }}>
      {/* Étoiles */}
      <div className="flex gap-1">
        {Array.from({ length: r.score || r.rating || 5 }).map((_, i) => (
          <span key={i} style={{ color: 'var(--sf-accent)', fontSize: 13 }}>★</span>
        ))}
      </div>

      {/* Témoignage */}
      <p className="text-[13px] leading-relaxed italic flex-1" style={{ color: 'var(--sf-text-2, #374151)' }}>
        "{r.text || r.content}"
      </p>

      {/* Auteur */}
      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--sf-border)' }}>
        {avatar ? (
          <img src={avatar} alt={name}
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            style={{ border: '2px solid var(--sf-border)' }} />
        ) : (
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
            style={{ background: 'var(--sf-primary)' }}>
            {initials}
          </div>
        )}
        <div>
          <div className="text-[13px] font-bold leading-tight" style={{ color: 'var(--sf-text)' }}>{name}</div>
          {(r.role || r.company) && (
            <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--sf-muted)' }}>
              {[r.role, r.company].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { theme } = useTheme()
  const [articles,         setArticles]         = useState([])
  const [reviews,          setReviews]          = useState([])
  const [loadingArticles,  setLoadingArticles]  = useState(true)
  const [loadingReviews,   setLoadingReviews]   = useState(true)
  const [articlesErr,      setArticlesErr]      = useState(null)

  useEffect(() => {
    getArticles({ limit: 9 }).then(({ data, error }) => {
      setArticles(data)
      setArticlesErr(error)
      setLoadingArticles(false)
    })
    getReviews({ limit: 8 }).then(({ data }) => {
      setReviews(data)
      setLoadingReviews(false)
    })
  }, [])

  const sectionOrder = (theme.sections?.order || ['hero', 'features', 'articles'])
    .filter(k => k !== 'hero')

  const FeaturesSection = theme.sections?.showFeatures !== false ? (
    <section key="features" style={{ background: 'var(--sf-surface)', borderBottom: '1px solid var(--sf-border)' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
        <p className="text-center text-[10px] font-bold tracking-[.2em] uppercase mb-8" style={{ color: 'var(--sf-muted)' }}>
          Tout ce que SPORTFIN vous apporte
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {FEATURES.map(f => (
            <div key={f.label}
              className="flex flex-col items-center text-center px-3 py-4 rounded-2xl transition-all cursor-default group"
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--sf-bg)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px] mb-2.5 transition-transform group-hover:scale-110"
                style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-border)' }}>
                {f.icon}
              </div>
              <div className="text-[11.5px] font-semibold leading-snug mb-0.5" style={{ color: 'var(--sf-text)' }}>{f.label}</div>
              <div className="text-[10px] leading-snug hidden lg:block" style={{ color: 'var(--sf-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  ) : null

  const ArticlesSection = theme.sections?.showArticles !== false ? (
    <section key="articles" className="max-w-[1360px] mx-auto px-6 lg:px-10 py-12">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-12">

        {/* Articles */}
        <div>
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="eyebrow">Actualité sport &amp; économie</span>
              <h2 className="section-title mb-0">Les grandes analyses</h2>
            </div>
            <Link to="/articles" className="text-[12.5px] font-semibold flex items-center gap-1 flex-shrink-0"
              style={{ color: 'var(--sf-primary)' }}>
              Tous les articles →
            </Link>
          </div>

          {loadingArticles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 rounded-2xl skeleton" />)}
            </div>
          ) : articlesErr ? (
            <div className="text-center py-12" style={{ color: 'var(--sf-muted)' }}>
              <div className="text-3xl mb-2">⚠️</div>
              <p className="text-[13px] font-medium mb-1" style={{ color: '#991b1b' }}>Impossible de charger les articles</p>
              <p className="text-[12px]" style={{ color: '#b91c1c' }}>{articlesErr}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--sf-muted)' }}>
              <div className="text-4xl mb-3">📰</div>
              <p className="text-[14px] font-medium">Les articles arrivent bientôt.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map(a => <ArticleCard key={a.id} a={a} />)}
            </div>
          )}
        </div>

        {/* Reviews */}
        {theme.sections?.showReviews !== false && (
          <aside>
            <span className="eyebrow">Avis utilisateurs</span>
            <h2 className="section-title mb-1" style={{ fontSize: '20px' }}>Ils nous font confiance</h2>
            <div className="flex items-center gap-1.5 mb-6">
              <span style={{ color: 'var(--sf-accent)', letterSpacing: 1, fontSize: 13 }}>★★★★★</span>
              <span className="text-[12px] font-medium" style={{ color: 'var(--sf-muted)' }}>4,9/5 · 312 avis</span>
            </div>

            {loadingReviews ? (
              <div className="flex flex-col gap-3">
                {[1,2,3].map(i => <div key={i} className="h-28 skeleton rounded-xl" />)}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-[13px]" style={{ color: 'var(--sf-muted)' }}>Les avis seront disponibles prochainement.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((r, i) => <ReviewCard key={r.id || i} r={r} />)}
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  ) : null

  const SECTIONS = { features: FeaturesSection, articles: ArticlesSection }

  return (
    <div className="pt-[64px]">

      {/* ── Hero — toujours en premier ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, var(--sf-primary-dark, #071a32) 0%, var(--sf-primary) 55%, var(--sf-primary-light, #163b6b) 100%)' }}
      >
        {theme.heroImage && (
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${theme.heroImage})`, opacity: .1 }} />
        )}
        <div className="absolute inset-0 opacity-[.035]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 56px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 56px)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,.07) 0%, transparent 70%)' }} />

        <div className="relative max-w-[780px] mx-auto px-6 text-center py-8 lg:py-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1 mb-5 text-[10px] font-bold tracking-[.1em] uppercase"
            style={{ background: 'rgba(201,168,76,.13)', border: '1px solid rgba(201,168,76,.28)', color: 'var(--sf-accent)' }}>
            🏆 Plateforme N°1 du Sport Business
          </div>

          <h1 className="font-serif font-extrabold text-white leading-[1.07] mb-4"
            style={{ fontSize: 'clamp(28px, 3.8vw, 48px)' }}>
            La référence<br />
            <span style={{ color: 'var(--sf-accent)' }}>du sport business</span>
          </h1>

          <p className="leading-relaxed mb-6 max-w-[480px] mx-auto text-[14.5px]"
            style={{ color: 'rgba(255,255,255,.65)' }}>
            Cours, certification, quiz, podcasts et career center — tout ce qu'il faut pour réussir dans le sport business professionnel.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link to="/cours" className="btn btn-accent btn-lg">Commencer gratuitement →</Link>
            <Link to="/certification" className="btn btn-white btn-lg">Voir la certification</Link>
          </div>

          {theme.sections?.showStats !== false && (
            <div className="flex items-center justify-center flex-wrap gap-0">
              {[
                ['4 500+', 'Apprenants'],
                ['98%', 'Satisfaction'],
                ['4', 'Modules'],
                ['3 000+', 'Certifiés'],
              ].map(([n, l], i) => (
                <div key={l} className="flex items-center">
                  {i > 0 && <div className="h-6 w-px mx-5 flex-shrink-0" style={{ background: 'rgba(255,255,255,.14)' }} />}
                  <div className="text-center">
                    <div className="font-extrabold text-white leading-none"
                      style={{ fontSize: 'clamp(16px, 1.8vw, 22px)', fontFamily: 'var(--sf-font-heading)' }}>{n}</div>
                    <div className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>{l}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Sections ordonnées par l'admin ── */}
      {sectionOrder.map(key => SECTIONS[key] ?? null)}
    </div>
  )
}
