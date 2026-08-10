import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlans } from '../services/plansService'

const FAQ = [
  ['Puis-je annuler à tout moment ?', 'Oui, sans engagement. L\'abonnement Premium est mensuel et résiliable à tout moment depuis votre compte.'],
  ['La certification est-elle reconnue ?', 'La certification SPORTFIN est reconnue par les clubs, ligues, agences et médias partenaires, et valorisable sur LinkedIn.'],
  ['Y a-t-il un essai gratuit ?', 'Oui. Le plan Gratuit vous donne accès à un large panel de contenus sans limite de temps ni carte bancaire requise.'],
  ['Puis-je passer à Premium plus tard ?', 'Absolument — vous pouvez upgrader à tout moment. Votre progression est conservée.'],
]

function PlanCard({ plan, idx, total, loading }) {
  if (loading) return <div className="h-80 skeleton rounded-2xl" />

  const isFeatured = plan.highlighted
  const isLast     = idx === total - 1 && !isFeatured
  const btnClass   = isFeatured ? 'btn-primary' : isLast ? 'btn-accent' : 'btn-outline'
  const features   = Array.isArray(plan.features) ? plan.features : []

  return (
    <div className="relative flex flex-col" style={isFeatured ? { transform: 'scale(1.03)', zIndex: 10 } : {}}>
      {isFeatured && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
          <span className="px-4 py-1 rounded-full text-xs font-bold text-white shadow"
            style={{ background: 'var(--sf-primary)' }}>
            Plus populaire
          </span>
        </div>
      )}
      <div className="card flex flex-col flex-1 p-7 pt-8"
        style={isFeatured
          ? { borderColor: 'var(--sf-primary)', borderWidth: 2, boxShadow: '0 20px 60px rgba(11,37,69,.15)' }
          : isLast
          ? { borderColor: 'var(--sf-accent)', borderWidth: 2 }
          : {}
        }>
        <h3 className="font-extrabold text-base mb-1" style={{ color: 'var(--sf-text)' }}>{plan.name}</h3>
        {plan.subtitle && <p className="text-[12px] mb-3" style={{ color: 'var(--sf-muted)' }}>{plan.subtitle}</p>}
        <div className="mb-6">
          <span className="text-4xl font-extrabold" style={{ color: 'var(--sf-primary)' }}>
            {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
          </span>
          {plan.period && <span className="text-sm" style={{ color: 'var(--sf-muted)' }}>{plan.period}</span>}
        </div>
        <ul className="space-y-2.5 mb-7 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--sf-text)' }}>
              <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <Link to="/profil" className={`btn w-full justify-center ${btnClass}`}>
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
              <PlanCard key={plan.id} plan={plan} idx={idx} total={plans.length} />
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
