import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFiche } from '../services/fichesService'
import { renderMd } from '../utils/renderMd'

const COLOR_ACCENTS = {
  blue:   { accent: '#0B2545', light: 'rgba(11,37,69,.1)',    text: '#0B2545' },
  gold:   { accent: '#C9A84C', light: 'rgba(201,168,76,.12)', text: '#7a5c1e' },
  green:  { accent: '#10b981', light: 'rgba(16,185,129,.1)',  text: '#065f46' },
  purple: { accent: '#8b5cf6', light: 'rgba(139,92,246,.1)',  text: '#5b21b6' },
  red:    { accent: '#ef4444', light: 'rgba(239,68,68,.08)',  text: '#991b1b' },
  gray:   { accent: '#6b7280', light: 'rgba(107,114,128,.08)',text: '#374151' },
}

export default function FichePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [fiche, setFiche] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    getFiche(id).then(({ data, error }) => {
      if (error || !data) setError(error || 'Fiche introuvable')
      else setFiche(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#071a32' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen text-center px-6" style={{ background: '#071a32' }}>
      <div>
        <div className="text-4xl mb-4">📋</div>
        <p className="text-white font-semibold mb-4">{error}</p>
        <button onClick={() => navigate('/cours')} className="text-sm underline" style={{ color: '#C9A84C' }}>
          Retour aux cours
        </button>
      </div>
    </div>
  )

  const col = COLOR_ACCENTS[fiche.color] || COLOR_ACCENTS.blue
  const hasContent = fiche.content && fiche.content.trim().length > 0

  return (
    <div style={{ background: 'var(--sf-bg)', minHeight: '100vh' }}>
      <style>{`
        .cs-table { width:100%; border-collapse:collapse; margin:12px 0; font-size:13.5px; }
        .cs-table th { background:#0B2545; color:#fff; font-weight:700; padding:9px 14px; text-align:left; }
        .cs-table td { padding:8px 14px; border-bottom:1px solid var(--sf-border); color:var(--sf-text); }
        .cs-table tr:last-child td { border-bottom:none; }
        .cs-table tr:nth-child(even) td { background:rgba(0,0,0,.02); }
        .katex-display { overflow-x: auto; overflow-y: hidden; }
      `}</style>

      {/* Top bar */}
      <div className="sticky top-[64px] z-30 shadow" style={{ background: '#071a32' }}>
        <div className="max-w-[860px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {fiche.emoji && (
              <span className="text-[20px] flex-shrink-0">{fiche.emoji}</span>
            )}
            <span className="font-bold text-white text-[14px] truncate">{fiche.title}</span>
          </div>
          <button onClick={() => navigate('/cours')}
            className="flex-shrink-0 text-[12px] font-semibold px-4 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)' }}>
            ← Retour aux cours
          </button>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-10">

        {/* Header card */}
        <div className="rounded-2xl p-7 mb-8"
          style={{ background: 'linear-gradient(135deg, #071a32 0%, #0B2545 100%)', border: '1px solid rgba(201,168,76,.2)' }}>
          <div className="flex items-start gap-4">
            {fiche.emoji && (
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-[28px]"
                style={{ background: `${col.light}`, border: `1.5px solid ${col.accent}44` }}>
                {fiche.emoji}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {fiche.category && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full"
                    style={{ background: 'rgba(201,168,76,.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.3)' }}>
                    {fiche.category}
                  </span>
                )}
                {fiche.difficulty && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)' }}>
                    {fiche.difficulty}
                  </span>
                )}
              </div>
              <h1 className="font-serif font-extrabold text-white text-[22px] leading-snug">{fiche.title}</h1>
              {fiche.subtitle && (
                <p className="mt-1 text-[13px]" style={{ color: 'rgba(255,255,255,.5)' }}>{fiche.subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Markdown content */}
        {hasContent && (
          <div className="rounded-2xl p-7 mb-8" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }}>
            <div className="text-[14px] leading-[1.9]" style={{ color: 'var(--sf-text)' }}
              dangerouslySetInnerHTML={{ __html: renderMd(fiche.content) }} />
          </div>
        )}

        {/* PDF viewer (optional, if present) */}
        {fiche.pdf_url && (
          <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid var(--sf-border)' }}>
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ background: 'var(--sf-surface)', borderBottom: '1px solid var(--sf-border)' }}>
              <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--sf-primary)' }}>
                Document PDF
              </span>
              <div className="flex gap-2">
                <a href={fiche.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="text-[11.5px] font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(11,37,69,.08)', color: 'var(--sf-primary)' }}>
                  ↗ Nouvel onglet
                </a>
              </div>
            </div>
            <iframe src={fiche.pdf_url} title={fiche.title}
              className="w-full block" style={{ height: 700, border: 'none' }} />
          </div>
        )}

        {/* Back button */}
        <button onClick={() => navigate('/cours')}
          className="w-full py-4 rounded-2xl font-bold text-[14px]"
          style={{ background: 'var(--sf-surface)', border: '1.5px solid var(--sf-border)', color: 'var(--sf-text)' }}>
          ← Retour aux cours
        </button>
      </div>
    </div>
  )
}
