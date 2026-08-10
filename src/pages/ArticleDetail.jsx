import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ArticleDetail() {
  const { id } = useParams()
  const [article,  setArticle]  = useState(null)
  const [error,    setError]    = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true); setError(null); setNotFound(false)
    supabase.from('articles').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) {
          // PGRST116 = no rows found (.single() returned 0 rows)
          if (error.code === 'PGRST116') setNotFound(true)
          else setError(error.message)
        } else {
          setArticle(data)
        }
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="pt-[64px] flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
        style={{ borderColor: 'var(--sf-primary)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (notFound) return (
    <div className="pt-[64px] flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">📰</div>
        <p className="font-semibold text-[16px] mb-1" style={{ color: 'var(--sf-text)' }}>Article introuvable</p>
        <p className="text-[13px] mb-5" style={{ color: 'var(--sf-muted)' }}>Cet article n'existe pas ou a été supprimé.</p>
        <Link to="/articles" className="btn btn-primary btn-sm">← Retour aux articles</Link>
      </div>
    </div>
  )

  if (error) return (
    <div className="pt-[64px] flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Erreur de chargement</p>
        <p className="text-[13px] mb-5" style={{ color: '#b91c1c' }}>{error}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/articles" className="btn btn-outline btn-sm">← Articles</Link>
          <button onClick={() => { setLoading(true); setError(null); supabase.from('articles').select('*').eq('id', id).single().then(({ data, error }) => { if (error) { if (error.code === 'PGRST116') setNotFound(true); else setError(error.message) } else setArticle(data); setLoading(false) }) }}
            className="btn btn-primary btn-sm">Réessayer</button>
        </div>
      </div>
    </div>
  )

  if (!article) return null

  return (
    <div className="pt-[64px]">
      {article.cover_url ? (
        <div className="h-[340px] overflow-hidden">
          <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-[200px]" style={{ background: 'var(--sf-primary)' }} />
      )}

      <div className="max-w-[760px] mx-auto px-6 py-10">
        <Link to="/articles" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 transition-all hover:gap-2.5"
          style={{ color: 'var(--sf-primary)' }}>
          ← Retour aux articles
        </Link>

        <span className="badge badge-primary mb-4">{article.category}</span>
        <h1 className="font-serif text-2xl lg:text-3xl font-extrabold leading-tight mb-4" style={{ color: 'var(--sf-text)' }}>
          {article.title}
        </h1>
        <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--sf-muted)', fontSize: '1.05rem' }}>{article.excerpt}</p>

        <div className="flex items-center gap-4 py-4 border-y mb-10 text-sm flex-wrap" style={{ borderColor: 'var(--sf-border)', color: 'var(--sf-muted)' }}>
          {article.author    && <span>Par <strong style={{ color: 'var(--sf-primary)' }}>{article.author}</strong></span>}
          {article.published_at && <span>{new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
          {article.read_time && <span>⏱ {article.read_time} min</span>}
        </div>

        <div className="text-sm leading-[1.9] whitespace-pre-line" style={{ color: 'var(--sf-text)' }}>
          {article.content}
        </div>
      </div>
    </div>
  )
}
