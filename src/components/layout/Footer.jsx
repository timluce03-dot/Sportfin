import { Link } from 'react-router-dom'

const COLS = [
  { title: 'Formation', links: [['Cours', '/cours'], ['Certification', '/certification'], ['Quiz Sport', '/quiz'], ['Entretiens', '/entretiens']] },
  { title: 'Ressources', links: [['Articles', '/articles'], ['Podcasts & Interviews', '/podcasts'], ['Career Center', '/career']] },
  { title: 'Compte', links: [['Se connecter', '/profil'], ['Créer un compte', '/profil'], ['Mon espace', '/dashboard'], ['Tarifs', '/tarifs']] },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--sf-primary)' }}>
      <div className="max-w-[1360px] mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white text-xs font-extrabold">SF</div>
              <span className="text-white font-extrabold text-[15px] tracking-wide">SPORTFIN</span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed">La plateforme de référence pour comprendre et réussir dans le sport business professionnel.</p>
            <div className="flex items-center gap-3 mt-5">
              {['LinkedIn', 'Twitter', 'Instagram'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors text-xs font-bold">{s[0]}</a>
              ))}
            </div>
          </div>

          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-white/40 font-semibold text-xs tracking-widest uppercase mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}><Link to={to} className="text-white/65 text-sm hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/35 text-xs">© 2025 SPORTFIN. Tous droits réservés.</p>
          <div className="flex gap-5">
            {['Mentions légales', 'Confidentialité', 'CGV'].map(l => (
              <a key={l} href="#" className="text-white/35 text-xs hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
