import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlans } from '../services/plansService'

const FAQ = [
  ['Puis-je annuler à tout moment ?', 'Oui, sans engagement. L\'abonnement Premium est mensuel et résiliable à tout moment depuis votre compte.'],
  ['La certification est-elle reconnue ?', 'La certification SPORTFIN est reconnue par les clubs, ligues, agences et médias partenaires, et valorisable sur LinkedIn.'],
  ['Y a-t-il un essai gratuit ?', 'Oui. Le plan Gratuit vous donne accès à un large panel de contenus sans limite de temps ni carte bancaire requise.'],
  ['Puis-je passer à Premium plus tard ?', 'Absolument — vous pouvez upgrader à tout moment. Votre progression est conservée.'],
]

const STYLES = {
  default: {
    wrap: { background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', boxShadow: 'var(--sf-shadow-sm)', borderRadius: 20 },
    name: 'var(--sf-text)', sub: 'var(--sf-muted)', price: 'var(--sf-primary)', period: 'var(--sf-muted)',
    check: '#10b981', text: 'var(--sf-text)',
    engBg: 'var(--sf-bg)', engBorder: 'var(--sf-border)', engColor: 'var(--sf-muted)',
    btn: { background: '#e5e7eb', color: '#374151' }, badge: null,
  },
  featured: {
    wrap: { background: 'linear-gradient(160deg,#0B2545,#163b6b)', border: 'none', boxShadow: '0 20px 60px rgba(11,37,69,.4)', borderRadius: 20, transform: 'scale(1.05)', zIndex: 10 },
    name: '#fff', sub: 'rgba(255,255,255,.55)', price: '#fff', period: 'rgba(255,255,255,.5)',
    check: '#C9A84C', text: 'rgba(255,255,255,.8)',
    engBg: 'rgba(255,255,255,.07)', engBorder: 'rgba(255,255,255,.15)', engColor: 'rgba(255,255,255,.5)',
    btn: { background: '#C9A84C', color: '#071a32', fontWeight: 800 },
    badge: { label: '⭐ LE PLUS POPULAIRE', bg: '#C9A84C', color: '#071a32' },
  },
  gold: {
    wrap: { background: 'linear-gradient(150deg,#1a0e00,#2d1800,#1a0e00)', border: '1px solid #7a5c1e', boxShadow: '0 20px 60px rgba(201,168,76,.3)', borderRadius: 20 },
    name: '#C9A84C', sub: 'rgba(201,168,76,.6)', price: '#f0d080', period: 'rgba(240,208,128,.55)',
    check: '#f0d080', text: 'rgba(240,208,128,.85)',
    engBg: 'rgba(201,168,76,.08)', engBorder: 'rgba(201,168,76,.2)', engColor: 'rgba(201,168,76,.6)',
    btn: { background: 'linear-gradient(135deg,#b8892e,#C9A84C,#b8892e)', color: '#1a0e00', fontWeight: 800 },
    badge: { label: '🥇 MODULE GOLD', bg: 'linear-gradient(135deg,#b8892e,#f0d080)', color: '#1a0e00' },
  },
  premium: {
    wrap: { background: 'linear-gradient(150deg,#071a32,#0d2d57,#071a32)', border: '1.5px solid rgba(201,168,76,.4)', boxShadow: '0 20px 60px rgba(7,26,50,.55)', borderRadius: 20 },
    name: '#fff', sub: 'rgba(201,168,76,.7)', price: '#C9A84C', period: 'rgba(201,168,76,.5)',
    check: '#C9A84C', text: 'rgba(255,255,255,.75)',
    engBg: 'rgba(201,168,76,.07)', engBorder: 'rgba(201,168,76,.2)', engColor: 'rgba(201,168,76,.55)',
    btn: { background: 'rgba(201,168,76,.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.4)', fontWeight: 700 },
    badge: { label: '💎 CERTIFICATION', bg: 'rgba(201,168,76,.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.3)' },
  },
}

function PlanCard({ plan, loading }) {
  if (loading) return <div className="h-80 skeleton rounded-2xl" />

  const s        = STYLES[plan.card_style] || STYLES.default
  const features = Array.isArray(plan.features) ? plan.features : []

  return (
    <div className="relative flex flex-col transition-transform duration-200 hover:-translate-y-1" style={s.wrap}>
      {s.badge && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
          <span className="px-4 py-1 rounded-full text-[10px] font-extrabold tracking-wide shadow-sm whitespace-nowrap"
            style={{ background: s.badge.bg, color: s.badge.color, border: s.badge.border }}>
            {s.badge.label}
          </span>
        </div>
      )}
      <div className="flex flex-col flex-1 p-7 pt-8">
        <h3 className="font-serif font-extrabold text-[18px] mb-1" style={{ color: s.name }}>{plan.name}</h3>
        {plan.subtitle && <p className="text-[12px] mb-4" style={{ color: s.sub }}>{plan.subtitle}</p>}
        <div className="mb-6 flex items-end gap-1">
          <span className="font-serif font-black leading-none" style={{ fontSize: 40, color: s.price }}>
            {plan.price === 0 || plan.price === '0' ? 'Gratuit' : `${plan.price}€`}
          </span>
          {plan.period && <span className="text-sm pb-1" style={{ color: s.period }}>{plan.period}</span>}
        </div>
        <ul className="space-y-2.5 mb-6 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: s.text }}>
              <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: s.check }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
        {plan.engagement && (
          <p className="text-center text-[11px] mb-3 px-2 py-1.5 rounded-lg"
            style={{ color: s.engColor, background: s.engBg, border: `1px solid ${s.engBorder}` }}>
            🔒 {plan.engagement}
          </p>
        )}
        <Link to="/profil" className="btn w-full justify-center rounded-xl py-2.5 text-[13px]" style={s.btn}>
          {plan.cta_label || 'Commencer'}
        </Link>
      </div>
    </div>
  )
}

export default function Pricing() {
  const [plans,   setPlans]   = useState([])
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true); setError(null)
    getPlans().then(({ data, error }) => { setPlans(data); setError(error); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  return (
    <div className="pt-[64px]">
      {/* Hero */}
      <section style={{ background: 'var(--sf-primary)' }} className="px-6 py-16 text-center">
        <div className="max-w-[900px] mx-auto">
          <span className="eyebrow text-white/50">Tarifs</span>
          <h1 className="font-serif text-3xl lg:text-4xl font-extrabold text-white mb-3">
            Des offres adaptées<br />
            <span style={{ color: 'var(--sf-accent)' }}>à votre parcours</span>
          </h1>
          <p className="text-white/65 max-w-md mx-auto leading-relaxed">
            Commencez gratuitement et évoluez au rythme de votre ambition.
          </p>
        </div>
      </section>

      {/* Plans */}
      <div className="max-w-[1080px] mx-auto px-6 py-14">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {[1, 2, 3].map(i => <div key={i} className="h-80 skeleton rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="text-center py-20 mb-16">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Impossible de charger les tarifs</p>
            <p className="text-[13px] mb-4" style={{ color: '#b91c1c' }}>{error}</p>
            <button onClick={load} className="btn btn-outline btn-sm">Réessayer</button>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 mb-16">
            <div className="text-4xl mb-3">💳</div>
            <p className="font-semibold text-[15px] mb-1" style={{ color: 'var(--sf-text)' }}>Tarifs non disponibles pour le moment</p>
            <p className="text-[13px] mb-4" style={{ color: 'var(--sf-muted)' }}>Contactez-nous pour plus d'informations.</p>
            <a href="mailto:contact@sportfin.fr" className="btn btn-primary btn-sm">Nous contacter →</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {plans.map((plan, idx) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-[700px] mx-auto">
          <h2 className="font-serif text-2xl font-bold text-center mb-8" style={{ color: 'var(--sf-text)' }}>Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <div key={q} className="card p-5">
                <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--sf-text)' }}>{q}</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--sf-muted)' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
