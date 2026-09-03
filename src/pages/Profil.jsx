import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getPlans } from '../services/plansService'
import { getFaq } from '../services/faqService'

function usePlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getPlans().then(({ data }) => { setPlans(data); setLoading(false) })
  }, [])
  return { plans, loading }
}

const FAQ_LIMIT = 10

function FaqSection() {
  const [items,    setItems]    = useState([])
  const [showAll,  setShowAll]  = useState(false)
  const [openIdx,  setOpenIdx]  = useState(null)

  useEffect(() => { getFaq().then(({ data }) => setItems(data)) }, [])

  const visible = showAll ? items : items.slice(0, FAQ_LIMIT)

  if (items.length === 0) return null

  return (
    <section id="faq" className="max-w-[760px] mx-auto mt-16 mb-6">
      <div className="text-center mb-10">
        <span className="eyebrow">Questions fréquentes</span>
        <h2 className="section-title">Tout ce que vous devez savoir</h2>
      </div>
      <div className="space-y-2.5">
        {visible.map((item, i) => (
          <div key={item.id}
            className="rounded-2xl border overflow-hidden transition-all"
            style={{ borderColor: openIdx === i ? 'var(--sf-primary)' : 'var(--sf-border)', background: 'var(--sf-surface)' }}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
            >
              <span className="font-semibold text-[14px] leading-snug" style={{ color: 'var(--sf-text)' }}>
                {item.question}
              </span>
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold transition-transform"
                style={{
                  background: openIdx === i ? 'var(--sf-primary)' : 'var(--sf-border)',
                  color: openIdx === i ? '#fff' : 'var(--sf-muted)',
                  transform: openIdx === i ? 'rotate(45deg)' : 'rotate(0deg)',
                }}>
                +
              </span>
            </button>
            {openIdx === i && (
              <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--sf-border)' }}>
                <p className="text-[13.5px] leading-relaxed pt-3" style={{ color: 'var(--sf-muted)' }}>
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      {!showAll && items.length > FAQ_LIMIT && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="text-[13px] font-semibold px-6 py-2.5 rounded-xl border transition-colors"
            style={{ borderColor: 'var(--sf-border)', color: 'var(--sf-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sf-surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = '')}>
            Voir plus ({items.length - FAQ_LIMIT} questions) ↓
          </button>
        </div>
      )}
    </section>
  )
}

const VALUE_PROPS = [
  {
    icon: '📚',
    title: 'Formation structurée',
    desc: '4 parties, 15+ chapitres conçus par des praticiens du secteur ayant 20 ans d\'expérience dans des clubs et ligues.',
    accent: false,
  },
  {
    icon: '🏅',
    title: 'Certification reconnue',
    desc: 'Badge LinkedIn Sport Business Maker valorisé par les recruteurs des clubs, ligues et agences du sport professionnel.',
    accent: true,
  },
  {
    icon: '💼',
    title: 'Career Center',
    desc: '80+ offres sport business sélectionnées et mises à jour quotidiennement — stages, CDD, CDI en France et à l\'international.',
    accent: false,
  },
  {
    icon: '🧠',
    title: 'Quiz gamifiés',
    desc: '1 000+ questions, classements XP, streaks et badges — l\'apprentissage devient addictif et mesurable.',
    accent: false,
  },
]

const STYLES = {
  default: {
    wrap:   { background: 'var(--sf-surface)', border: '1px solid var(--sf-border)', boxShadow: 'var(--sf-shadow-sm)' },
    name:   '#0B2545',
    sub:    'var(--sf-muted)',
    price:  'var(--sf-primary)',
    period: 'var(--sf-muted)',
    check:  'var(--sf-accent)',
    text:   'var(--sf-text-2,#374151)',
    engBg:  'var(--sf-bg)', engBorder: 'var(--sf-border)', engColor: 'var(--sf-muted)',
    btn:    { background: '#e5e7eb', color: '#374151' },
    badge:  null,
  },
  featured: {
    wrap:   { background: 'linear-gradient(160deg,#0B2545,#163b6b)', border: 'none', boxShadow: '0 16px 48px rgba(11,37,69,.35)', transform: 'scale(1.04)' },
    name:   '#fff',
    sub:    'rgba(255,255,255,.55)',
    price:  '#fff',
    period: 'rgba(255,255,255,.5)',
    check:  '#C9A84C',
    text:   'rgba(255,255,255,.78)',
    engBg:  'rgba(255,255,255,.08)', engBorder: 'rgba(255,255,255,.15)', engColor: 'rgba(255,255,255,.5)',
    btn:    { background: '#C9A84C', color: '#071a32', fontWeight: 700 },
    badge:  { label: '⭐ LE PLUS POPULAIRE', bg: '#C9A84C', color: '#071a32' },
  },
  gold: {
    wrap:   { background: 'linear-gradient(150deg,#1a0e00 0%,#2d1800 50%,#1a0e00 100%)', border: '1px solid #7a5c1e', boxShadow: '0 16px 48px rgba(201,168,76,.25)' },
    name:   '#C9A84C',
    sub:    'rgba(201,168,76,.6)',
    price:  '#f0d080',
    period: 'rgba(240,208,128,.5)',
    check:  '#f0d080',
    text:   'rgba(240,208,128,.85)',
    engBg:  'rgba(201,168,76,.08)', engBorder: 'rgba(201,168,76,.2)', engColor: 'rgba(201,168,76,.6)',
    btn:    { background: 'linear-gradient(135deg,#b8892e,#C9A84C,#b8892e)', color: '#1a0e00', fontWeight: 800, letterSpacing: '0.03em' },
    badge:  { label: '🥇 MODULE GOLD', bg: 'linear-gradient(135deg,#b8892e,#f0d080)', color: '#1a0e00' },
  },
  premium: {
    wrap:   { background: 'linear-gradient(150deg,#071a32 0%,#0d2d57 60%,#071a32 100%)', border: '1.5px solid rgba(201,168,76,.4)', boxShadow: '0 16px 48px rgba(7,26,50,.5)' },
    name:   '#fff',
    sub:    'rgba(201,168,76,.7)',
    price:  '#C9A84C',
    period: 'rgba(201,168,76,.5)',
    check:  '#C9A84C',
    text:   'rgba(255,255,255,.75)',
    engBg:  'rgba(201,168,76,.07)', engBorder: 'rgba(201,168,76,.2)', engColor: 'rgba(201,168,76,.55)',
    btn:    { background: 'rgba(201,168,76,.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.4)', fontWeight: 700 },
    badge:  { label: '💎 CERTIFICATION', bg: 'rgba(201,168,76,.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,.35)' },
  },
}

function PricingCard({ plan }) {
  const s        = STYLES[plan.card_style] || STYLES.default
  const features = Array.isArray(plan.features) ? plan.features : []

  return (
    <div className="relative rounded-2xl flex flex-col p-6 transition-transform duration-200 hover:-translate-y-1" style={s.wrap}>
      {s.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap tracking-wide"
          style={{ background: s.badge.bg, color: s.badge.color, border: s.badge.border }}>
          {s.badge.label}
        </div>
      )}

      {/* Name + subtitle */}
      <div className="mb-4 mt-1">
        <div className="font-serif font-extrabold text-[18px] mb-0.5" style={{ color: s.name }}>{plan.name}</div>
        {plan.subtitle && <div className="text-[11.5px] font-medium" style={{ color: s.sub }}>{plan.subtitle}</div>}
      </div>

      {/* Price */}
      <div className="mb-5 flex items-end gap-1">
        <span className="font-serif font-black leading-none" style={{ fontSize: 36, color: s.price }}>
          {plan.price === 0 || plan.price === '0' ? 'Gratuit' : `${plan.price}€`}
        </span>
        {plan.period && <span className="text-[12px] pb-1" style={{ color: s.period }}>{plan.period}</span>}
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2.5 mb-5">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[12.5px]" style={{ color: s.text }}>
            <span className="mt-[1px] flex-shrink-0 font-bold text-[13px]" style={{ color: s.check }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      {/* Engagement */}
      {plan.engagement && (
        <p className="text-center text-[11px] mb-3 px-2 py-1.5 rounded-lg"
          style={{ color: s.engColor, background: s.engBg, border: `1px solid ${s.engBorder}` }}>
          🔒 {plan.engagement}
        </p>
      )}

      {/* CTA */}
      <Link to="/tarifs" className="btn w-full justify-center text-[13px] rounded-xl py-2.5" style={s.btn}>
        {plan.cta_label || 'Commencer'}
      </Link>
    </div>
  )
}

function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab]         = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [f, setF]             = useState({ email: '', password: '', firstName: '', lastName: '' })
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await signIn(f.email, f.password)
    if (error) setError('Email ou mot de passe incorrect.')
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await signUp(f.email, f.password, {
      full_name: `${f.firstName} ${f.lastName}`.trim(),
    })
    if (error) setError(error.message)
    else setSuccess('Vérifiez vos emails pour confirmer votre inscription.')
    setLoading(false)
  }

  return (
    <div className="card p-8">
      <div className="flex gap-1 mb-7 p-1 rounded-xl" style={{ background: 'var(--sf-surface-2, #f0f2f6)' }}>
        {[['login', 'Se connecter'], ['register', 'Créer un compte']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setError(''); setSuccess('') }}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
            style={
              tab === id
                ? { background: 'var(--sf-surface)', color: 'var(--sf-primary)', boxShadow: 'var(--sf-shadow-xs)' }
                : { color: 'var(--sf-muted)' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-[12.5px]" style={{ background: 'rgba(239,68,68,.07)', color: '#991b1b', border: '1px solid rgba(239,68,68,.15)' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl text-[12.5px]" style={{ background: 'rgba(16,185,129,.07)', color: '#065f46', border: '1px solid rgba(16,185,129,.2)' }}>
          {success}
        </div>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="votre@email.com" value={f.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="form-label">Mot de passe</label>
            <input type="password" className="form-input" placeholder="••••••••" value={f.password} onChange={set('password')} required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center mt-1 disabled:opacity-60">
            {loading ? 'Connexion…' : 'Se connecter →'}
          </button>
          <p className="text-[12px] text-center" style={{ color: 'var(--sf-muted)' }}>
            Mot de passe oublié ?&nbsp;
            <span className="font-semibold cursor-pointer" style={{ color: 'var(--sf-primary)' }}>Réinitialiser</span>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Prénom</label>
              <input className="form-input" placeholder="Jean" value={f.firstName} onChange={set('firstName')} required />
            </div>
            <div>
              <label className="form-label">Nom</label>
              <input className="form-input" placeholder="Dupont" value={f.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="jean@email.com" value={f.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="form-label">Mot de passe</label>
            <input type="password" className="form-input" placeholder="8+ caractères" value={f.password} onChange={set('password')} required minLength={8} />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center mt-1 disabled:opacity-60">
            {loading ? 'Création…' : 'Créer mon compte gratuit →'}
          </button>
        </form>
      )}
    </div>
  )
}

function LoggedInView({ user, profile, signOut, plans, plansLoading }) {
  const name     = profile?.full_name || user.email?.split('@')[0] || 'Utilisateur'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-8">
      {/* Sidebar */}
      <div className="space-y-4">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-5">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name}
                className="w-[50px] h-[50px] rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid var(--sf-border)' }} />
            ) : (
              <div
                className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white text-[17px] font-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--sf-primary), var(--sf-primary-light, #163b6b))' }}
              >
                {initials}
              </div>
            )}
            <div>
              <div className="font-bold text-[14.5px]" style={{ color: 'var(--sf-text)' }}>{name}</div>
              <div className="text-[11.5px]" style={{ color: 'var(--sf-muted)' }}>{user.email}</div>
              <span className="badge badge-primary mt-1">{profile?.role || 'Gratuit'}</span>
            </div>
          </div>

          <nav className="space-y-0.5">
            {[
              { to: '/dashboard', icon: '📊', label: 'Tableau de bord' },
              { to: '/cours',     icon: '📚', label: 'Mes cours' },
              { to: '/quiz',      icon: '🧠', label: 'Quiz Sport' },
              { to: '/admin',     icon: '⚙️', label: 'Administration' },
            ].map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
                style={{ color: 'var(--sf-text)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sf-surface-2, #f0f2f6)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
          </nav>

          <div className="border-t mt-4 pt-4" style={{ borderColor: 'var(--sf-border)' }}>
            <button
              onClick={signOut}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors"
              style={{ color: '#dc2626' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              → Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <div className="mb-6">
          <span className="eyebrow">Mon abonnement</span>
          <h2 className="section-title mb-0">Passez au niveau supérieur</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {plansLoading
            ? Array.from({length:3}).map((_,i) => <div key={i} className="h-72 skeleton rounded-2xl"/>)
            : plans.map(p => <PricingCard key={p.id} plan={p} />)}
        </div>
      </div>
    </div>
  )
}

export default function Profil() {
  const { user, profile, signOut } = useAuth()
  const { plans, loading: plansLoading } = usePlans()

  return (
    <div className="pt-[64px]" style={{ background: 'var(--sf-bg)' }}>

      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">
        {user ? (
          <LoggedInView user={user} profile={profile} signOut={signOut} plans={plans} plansLoading={plansLoading} />
        ) : (
          <>
            {/* ── Auth ── */}
            <div className="max-w-[420px] mx-auto mb-16">
              <AuthForm />
            </div>

            {/* ── Pricing ── */}
            <div>
              <div className="text-center mb-10">
                <span className="eyebrow">Tarifs</span>
                <h2 className="section-title">Choisissez votre formule</h2>
                <p className="text-[13.5px] max-w-[500px] mx-auto mt-2" style={{ color: 'var(--sf-muted)' }}>
                  Commencez gratuitement, upgradez quand vous êtes prêt.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 max-w-[1100px] mx-auto items-end">
                {plansLoading
                  ? Array.from({length:3}).map((_,i) => <div key={i} className="h-72 skeleton rounded-2xl"/>)
                  : plans.map(p => <PricingCard key={p.id} plan={p} />)}
              </div>
            </div>
          </>
        )}

        {/* ── FAQ ── */}
        <FaqSection />
      </div>
    </div>
  )
}
