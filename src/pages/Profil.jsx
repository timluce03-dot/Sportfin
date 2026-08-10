import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: '',
    desc: 'Pour découvrir la plateforme',
    features: [
      'Cours d\'introduction (3 chapitres)',
      'Articles en accès libre',
      'Quiz de base (3 thèmes)',
      'Career Center limité',
    ],
    cta: 'Plan actuel',
    disabled: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '24,99€',
    period: '/mois',
    desc: 'Pour commencer sérieusement',
    features: [
      'Accès à tous les cours (hors Module Gold)',
      'Career Center complet',
      'Tous les quiz + classements',
      'Podcasts & interviews',
    ],
    cta: 'Choisir Starter',
    featured: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '39,99€',
    period: '/mois',
    desc: 'Pour les candidats ambitieux',
    features: [
      'Tout Starter inclus',
      'Module Gold (Private Equity, M&A)',
      '15% de remise sur la certification',
      'Exercices pratiques corrigés',
      'Accès prioritaire aux nouveaux contenus',
    ],
    cta: 'Passer à Premium',
    featured: true,
  },
  {
    id: 'certification',
    name: 'Certification',
    price: '59,99€',
    period: ' unique',
    desc: 'Pour décrocher le badge SBM',
    features: [
      'Tout Premium inclus',
      'Badge SBM+ / SBM++ / SBM+++',
      'Certification LinkedIn officielle',
      'Annales corrigées du test',
      'Accès à vie au programme',
    ],
    cta: 'Obtenir la certification',
    gold: true,
  },
]

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

function PricingCard({ plan }) {
  const isDark = plan.featured || plan.gold

  return (
    <div
      className="relative rounded-2xl flex flex-col p-6"
      style={{
        background: plan.gold
          ? 'linear-gradient(145deg, #6b4c0d, #b8892e)'
          : plan.featured
          ? 'var(--sf-primary)'
          : 'var(--sf-surface)',
        border: isDark ? 'none' : '1px solid var(--sf-border)',
        boxShadow: plan.featured
          ? '0 12px 40px rgba(11,37,69,.28)'
          : plan.gold
          ? '0 12px 40px rgba(184,137,46,.3)'
          : 'var(--sf-shadow-sm)',
        transform: plan.featured ? 'scale(1.03)' : undefined,
      }}
    >
      {plan.featured && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
          style={{ background: 'var(--sf-accent)' }}
        >
          LE PLUS POPULAIRE
        </div>
      )}

      <div className="mb-4">
        <div className="font-serif font-extrabold text-[17px] mb-0.5"
          style={{ color: isDark ? '#fff' : 'var(--sf-text)' }}>
          {plan.name}
        </div>
        <div className="text-[11px] font-medium"
          style={{ color: isDark ? 'rgba(255,255,255,.55)' : 'var(--sf-muted)' }}>
          {plan.desc}
        </div>
      </div>

      <div className="mb-5 flex items-end gap-0.5">
        <span className="font-serif font-black leading-none"
          style={{ fontSize: 34, color: isDark ? '#fff' : 'var(--sf-primary)' }}>
          {plan.price}
        </span>
        <span className="text-[12px] pb-0.5"
          style={{ color: isDark ? 'rgba(255,255,255,.5)' : 'var(--sf-muted)' }}>
          {plan.period}
        </span>
      </div>

      <ul className="flex-1 space-y-2.5 mb-6">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-[12.5px]"
            style={{ color: isDark ? 'rgba(255,255,255,.78)' : 'var(--sf-text-2, #374151)' }}>
            <span className="mt-[1px] flex-shrink-0 font-bold text-[13px]"
              style={{ color: plan.gold ? 'rgba(255,220,100,.9)' : isDark ? 'rgba(201,168,76,.9)' : 'var(--sf-accent)' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        disabled={plan.disabled}
        className={`btn w-full justify-center text-[13px] font-semibold ${plan.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        style={
          plan.gold
            ? { background: 'rgba(255,255,255,.18)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }
            : plan.featured
            ? { background: 'var(--sf-accent)', color: '#2a1a00' }
            : isDark
            ? { background: 'rgba(255,255,255,.13)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }
            : { background: 'var(--sf-primary)', color: '#fff' }
        }
      >
        {plan.cta}
      </button>
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

function LoggedInView({ user, profile, signOut }) {
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
          {PLANS.map(p => <PricingCard key={p.id} plan={p} />)}
        </div>
      </div>
    </div>
  )
}

export default function Profil() {
  const { user, profile, signOut } = useAuth()

  return (
    <div className="pt-[64px]" style={{ background: 'var(--sf-bg)' }}>

      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">
        {user ? (
          <LoggedInView user={user} profile={profile} signOut={signOut} />
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
                  Commencez gratuitement, upgradez quand vous êtes prêt. Aucun engagement sur les plans mensuels.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 max-w-[1100px] mx-auto items-end">
                {PLANS.map(p => <PricingCard key={p.id} plan={p} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
