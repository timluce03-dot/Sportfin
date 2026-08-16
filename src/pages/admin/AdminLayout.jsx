import { NavLink, Outlet, Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const SF_DARK = '#071a32'
const SF_NAV  = '#0B2545'
const SF_GOLD = '#C9A84C'

const NAV_SECTIONS = [
  {
    links: [{ to: '/admin', label: 'Dashboard', icon: '▣', end: true }],
  },
  {
    label: 'Contenu',
    links: [
      { to: '/admin/courses',   label: 'Modules',   icon: '📚' },
      { to: '/admin/chapters',  label: 'Cours',     icon: '📑' },
      { to: '/admin/exercises', label: 'Exercices', icon: '✏️' },
      { to: '/admin/quizzes',   label: 'Quiz',      icon: '🧠' },
      { to: '/admin/questions', label: 'Questions', icon: '❓' },
      { to: '/admin/articles',  label: 'Articles',  icon: '📰' },
      { to: '/admin/podcasts',  label: 'Podcasts',  icon: '🎙️' },
    ],
  },
  {
    label: 'Communauté',
    links: [
      { to: '/admin/jobs',           label: 'Career Center', icon: '💼' },
      { to: '/admin/career-metiers', label: 'Métiers',       icon: '🧭' },
      { to: '/admin/reviews',        label: 'Avis',          icon: '⭐' },
      { to: '/admin/partners',       label: 'Partenaires',   icon: '🤝' },
    ],
  },
  {
    label: 'Offres',
    links: [
      { to: '/admin/pricing',       label: 'Tarifs',       icon: '💎' },
      { to: '/admin/certification', label: 'Certification', icon: '🏅' },
    ],
  },
  {
    label: 'Plateforme',
    links: [
      { to: '/admin/design',   label: 'Apparence',  icon: '🎨' },
      { to: '/admin/settings', label: 'Paramètres', icon: '⚙️' },
    ],
  },
]

function SideLink({ to, end, icon, label }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg text-[12.5px] font-medium w-full transition-colors duration-100 ${
          isActive ? 'text-white' : 'text-white/55 hover:text-white/90 hover:bg-white/[.06]'
        }`
      }
      style={({ isActive }) => ({
        padding: '7px 10px 7px 9px',
        borderLeft: isActive ? `3px solid ${SF_GOLD}` : '3px solid transparent',
        background: isActive ? 'rgba(201,168,76,0.13)' : '',
      })}
    >
      <span className="w-5 text-center flex-shrink-0 text-[15px]">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function AdminLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: SF_DARK }}>
      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: SF_GOLD, borderTopColor: 'transparent' }} />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (profile && profile.role !== 'admin') return <Navigate to="/dashboard" replace />

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#f0f2f7' }}>

      {/* ── Sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex flex-col"
        style={{ width: 232, background: SF_NAV, borderRight: `1px solid rgba(255,255,255,0.06)` }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-[18px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-extrabold flex-shrink-0"
            style={{ background: SF_GOLD, color: SF_NAV, letterSpacing: '-0.02em' }}>SF</div>
          <div>
            <div className="font-bold text-white leading-none text-[13px]">SportFin</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Administration</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 px-3 py-4 overflow-y-auto">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i} className={i > 0 ? 'mt-5' : ''}>
              {section.label && (
                <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: `${SF_GOLD}70` }}>
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.links.map(link => (
                  <SideLink key={link.to} {...link} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: 'rgba(201,168,76,0.18)', color: SF_GOLD }}>
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-white/80 truncate">{user?.email}</div>
              <div className="text-[9.5px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Administrateur</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/"
              className="flex-1 text-center text-[11.5px] font-semibold py-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)' }}>
              ← Voir le site
            </Link>
            <button onClick={handleSignOut}
              title="Se déconnecter"
              className="px-2.5 py-1.5 rounded-lg text-[13px] transition-colors hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
              ⏏
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 p-8 overflow-y-auto" style={{ marginLeft: 232, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}
