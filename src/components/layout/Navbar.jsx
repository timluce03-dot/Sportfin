import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import AuthModal from '../AuthModal'

/* 7 modules exactly as specified */
const NAV = [
  { to: '/',              label: 'Accueil',       exact: true },
  { to: '/cours',         label: 'Cours' },
  { to: '/certification', label: 'Certification' },
  { to: '/career',        label: 'Career Center' },
  { to: '/podcasts',      label: 'Podcasts' },
  { to: '/quiz',          label: 'Quiz Sport' },
  { to: '/profil',        label: 'Profil' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const [modal, setModal] = useState(false)
  const [mobile, setMobile] = useState(false)

  const isActive = ({ to, exact }) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <>
      {/* ── NAV BAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center"
        style={{
          background: 'rgba(255,255,255,.97)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--sf-border)',
        }}
      >
        <div className="w-full max-w-[1400px] mx-auto px-5 lg:px-8 flex items-center gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 mr-6">
            {theme.logo ? (
              <img src={theme.logo} alt="SportFin" className="h-[34px] w-auto" />
            ) : (
              <>
                <div
                  className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-white text-[11px] font-black tracking-wider flex-shrink-0"
                  style={{ background: 'var(--sf-primary)' }}
                >
                  SF
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[14.5px] font-black tracking-[.055em]" style={{ color: 'var(--sf-primary)' }}>
                    SPORTFIN
                  </span>
                  <span className="text-[8px] font-semibold tracking-[.17em] uppercase" style={{ color: 'var(--sf-muted)' }}>
                    Sport Business Platform
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* ── Desktop links ── */}
          <div className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
            {NAV.map((item) => {
              const active = isActive(item)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="relative px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all"
                  style={{ color: active ? 'var(--sf-primary)' : 'var(--sf-muted)' }}
                >
                  {active && (
                    <span
                      className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full"
                      style={{ background: 'var(--sf-accent)' }}
                    />
                  )}
                  <span className={active ? 'font-semibold' : ''}>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* ── Right actions ── */}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                  Mon espace
                </Link>
                <Link to="/admin" className="btn btn-ghost btn-sm hidden md:inline-flex text-[12px]">
                  Admin
                </Link>
                <button onClick={signOut} className="btn btn-outline btn-sm">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setModal(true)}
                  className="btn btn-ghost btn-sm hidden sm:inline-flex"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => setModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ background: 'var(--sf-primary)' }}
                >
                  Commencer →
                </button>
              </>
            )}

            {/* ── Hamburger ── */}
            <button
              className="xl:hidden ml-1 p-2 rounded-lg transition-colors hover:bg-gray-100"
              onClick={() => setMobile(!mobile)}
              aria-label="Menu"
            >
              <div className="flex flex-col gap-[5px]">
                <span className={`block h-[1.5px] rounded-full bg-gray-500 transition-all ${mobile ? 'w-5 rotate-45 translate-y-[6.5px]' : 'w-5'}`} />
                <span className={`block h-[1.5px] rounded-full bg-gray-500 transition-all ${mobile ? 'opacity-0' : 'w-5'}`} />
                <span className={`block h-[1.5px] rounded-full bg-gray-500 transition-all ${mobile ? 'w-5 -rotate-45 -translate-y-[6.5px]' : 'w-3.5 ml-auto'}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobile && (
        <div className="fixed inset-0 z-40 xl:hidden" onClick={() => setMobile(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="absolute top-0 left-0 bottom-0 w-72 flex flex-col pt-[64px] shadow-2xl"
            style={{ background: 'var(--sf-surface)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
              {NAV.map((item) => {
                const active = isActive(item)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobile(false)}
                    className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={active
                      ? { color: 'var(--sf-primary)', background: 'rgba(11,37,69,.06)', fontWeight: 600 }
                      : { color: 'var(--sf-muted)' }
                    }
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
            <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--sf-border)' }}>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobile(false)}
                    className="btn btn-outline w-full justify-center">Mon espace</Link>
                  <button onClick={() => { signOut(); setMobile(false) }}
                    className="btn btn-ghost w-full justify-center text-sm">Déconnexion</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setModal(true); setMobile(false) }}
                    className="btn btn-outline w-full justify-center">Se connecter</button>
                  <button onClick={() => { setModal(true); setMobile(false) }}
                    className="btn btn-primary w-full justify-center">Commencer gratuitement</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modal && <AuthModal onClose={() => setModal(false)} />}
    </>
  )
}
