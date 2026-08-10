import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [f, setF] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'Étudiant', goal: 'Apprendre le sport business' })
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('')
    if (tab === 'login') {
      const { error } = await signIn(f.email, f.password)
      if (error) setError('Email ou mot de passe incorrect.')
      else { onClose(); navigate('/dashboard') }
    } else {
      const { error } = await signUp(f.email, f.password, { full_name: `${f.firstName} ${f.lastName}`, role: f.role, goal: f.goal })
      if (error) setError(error.message)
      else { onClose(); navigate('/dashboard') }
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.45)' }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-[400px] w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 text-sm transition-colors">✕</button>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold" style={{ background: 'var(--sf-primary)' }}>SF</div>
            <span className="font-extrabold text-base" style={{ color: 'var(--sf-primary)' }}>SPORTFIN</span>
          </div>
          <h2 className="font-serif text-xl font-bold" style={{ color: 'var(--sf-text)' }}>
            {tab === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {[['login','Connexion'],['register','Inscription']].map(([id,l]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${tab===id?'bg-white shadow-sm':'text-gray-500'}`}
              style={tab===id?{color:'var(--sf-primary)'}:{}}>
              {l}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 text-xs mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <form onSubmit={submit} className="space-y-3.5">
          {tab === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="form-label">Prénom</label><input className="form-input" placeholder="Jean" value={f.firstName} onChange={set('firstName')} required /></div>
              <div><label className="form-label">Nom</label><input className="form-input" placeholder="Dupont" value={f.lastName} onChange={set('lastName')} required /></div>
            </div>
          )}
          <div><label className="form-label">Email</label><input type="email" className="form-input" placeholder="vous@email.com" value={f.email} onChange={set('email')} required /></div>
          <div><label className="form-label">Mot de passe</label><input type="password" className="form-input" placeholder="8+ caractères" value={f.password} onChange={set('password')} required /></div>
          {tab === 'register' && (
            <>
              <div><label className="form-label">Profil</label>
                <select className="form-input" value={f.role} onChange={set('role')}>
                  {['Étudiant','Professionnel','En reconversion','Passionné'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="form-label">Objectif</label>
                <select className="form-input" value={f.goal} onChange={set('goal')}>
                  {['Apprendre le sport business','Obtenir une certification','Trouver un emploi','Préparer un entretien'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center mt-2 disabled:opacity-60">
            {loading ? '...' : tab === 'login' ? 'Se connecter' : 'Créer mon compte gratuit'}
          </button>
        </form>
      </div>
    </div>
  )
}
