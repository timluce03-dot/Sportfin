import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../services/articlesService'

const CATS = ['Tous', 'Droits TV', 'Finance', 'Sponsoring', 'Stratégie', 'Carrières', 'Investissement', 'Data', 'Sport féminin', 'Billetterie']

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

      {/* ── Content ── */}
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
    </div>
  )
}
