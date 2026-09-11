import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const ACTIVITIES = [
  'Étudiant(e) intéressé(e) par les métiers du sport',
  'Professionnel(le) en reconversion vers les métiers du sport',
  'Amoureux/amoureuse du sport, curieux des rouages économiques',
  'Autre',
]

const SCHOOL_TYPES = [
  'École de commerce',
  'École de communication',
  'IAE (Institut d\'Administration des Entreprises)',
  'École de journalisme / médias',
  'Université — Sciences du sport / STAPS',
  'IUT',
  'École d\'ingénieurs',
  'Sciences Po / école politique',
  'Autre établissement',
]

const OBJECTIVES = [
  'Trouver un emploi dans le monde du sport',
  'Améliorer ma culture générale du sport business',
  'Me tenir informé(e) de l\'actualité économique sportive',
  'Préparer une reconversion professionnelle',
  'Obtenir une certification reconnue',
  'Préparer un concours ou un entretien',
  'Accompagner mon projet entrepreneurial dans le sport',
  'Autre objectif',
]

const AGE_RANGES = ['Moins de 18 ans', '18 – 24 ans', '25 – 34 ans', '35 – 44 ans', '45 ans et plus']

const HOW_FOUND = [
  'Réseaux sociaux (Instagram, TikTok, LinkedIn…)',
  'Bouche à oreille / recommandation',
  'Moteur de recherche (Google…)',
  'Podcast ou interview',
  'Article de presse / blog',
  'Mon école ou université',
  'Autre',
]

const EMPTY_REG = {
  civility: 'M.',
  firstName: '', lastName: '',
  email: '', password: '', passwordConfirm: '',
  activity: ACTIVITIES[0], schoolType: '',
  objective: OBJECTIVES[0],
  ageRange: '18 – 24 ans',
  howFound: HOW_FOUND[0],
}

export default function AuthModal({ onClose }) {
  const [tab,     setTab]     = useState('login')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [login, setLogin] = useState({ email: '', password: '' })
  const [reg,   setReg]   = useState(EMPTY_REG)

  const setL = k => e => setLogin(p => ({ ...p, [k]: e.target.value }))
  const setR = k => e => setReg(p => ({ ...p, [k]: e.target.value }))

  const isStudent = reg.activity === ACTIVITIES[0]

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('')

    if (tab === 'login') {
      const { error } = await signIn(login.email, login.password)
      if (error) setError('Email ou mot de passe incorrect.')
      else { onClose(); navigate('/dashboard') }
    } else {
      if (reg.password !== reg.passwordConfirm) {
        setError('Les mots de passe ne correspondent pas.'); setLoading(false); return
      }
      if (reg.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères.'); setLoading(false); return
      }
      const meta = {
        full_name:   `${reg.firstName} ${reg.lastName}`,
        civility:    reg.civility,
        first_name:  reg.firstName,
        last_name:   reg.lastName,
        activity:    reg.activity,
        school_type: isStudent ? reg.schoolType : null,
        objective:   reg.objective,
        age_range:   reg.ageRange,
        how_found:   reg.howFound,
      }
      const { error } = await signUp(reg.email, reg.password, meta)
      if (error) setError(error.message)
      else { onClose(); navigate('/dashboard') }
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.5)' }}
      onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full relative flex flex-col"
        style={{ maxWidth: tab === 'register' ? 480 : 400, maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header fixe */}
        <div className="p-7 pb-4 flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 text-sm">✕</button>

          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold" style={{ background: 'var(--sf-primary)' }}>SF</div>
              <span className="font-extrabold text-base" style={{ color: 'var(--sf-primary)' }}>SPORTFIN</span>
            </div>
            <h2 className="font-serif text-xl font-bold" style={{ color: 'var(--sf-text)' }}>
              {tab === 'login' ? 'Bon retour 👋' : 'Rejoindre SportFin'}
            </h2>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1">
            {[['login','Connexion'],['register','Inscription']].map(([id, l]) => (
              <button key={id} onClick={() => { setTab(id); setError('') }}
                className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all ${tab === id ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                style={tab === id ? { color: 'var(--sf-primary)' } : {}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="px-7 pb-7 overflow-y-auto flex-1">
          {error && <p className="text-red-600 text-xs mb-4 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>}

          <form onSubmit={submit} className="space-y-3.5">

            {tab === 'login' ? (
              <>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="vous@email.com" value={login.email} onChange={setL('email')} required />
                </div>
                <div>
                  <label className="form-label">Mot de passe</label>
                  <input type="password" className="form-input" placeholder="Votre mot de passe" value={login.password} onChange={setL('password')} required />
                </div>
              </>
            ) : (
              <>
                {/* Civilité */}
                <div>
                  <label className="form-label">Civilité</label>
                  <div className="flex gap-2">
                    {['M.', 'Mme'].map(c => (
                      <button key={c} type="button" onClick={() => setReg(p => ({ ...p, civility: c }))}
                        className={`flex-1 py-2 rounded-xl text-[13px] font-semibold border-2 transition-all ${reg.civility === c ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prénom / Nom */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Prénom *</label>
                    <input className="form-input" placeholder="Jean" value={reg.firstName} onChange={setR('firstName')} required />
                  </div>
                  <div>
                    <label className="form-label">Nom *</label>
                    <input className="form-input" placeholder="Dupont" value={reg.lastName} onChange={setR('lastName')} required />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="form-label">Adresse email *</label>
                  <input type="email" className="form-input" placeholder="vous@email.com" value={reg.email} onChange={setR('email')} required />
                </div>

                {/* Password x2 */}
                <div>
                  <label className="form-label">Mot de passe * <span className="text-gray-400 font-normal">(8 caractères minimum)</span></label>
                  <input type="password" className="form-input" placeholder="••••••••" value={reg.password} onChange={setR('password')} required />
                </div>
                <div>
                  <label className="form-label">Confirmer le mot de passe *</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={reg.passwordConfirm} onChange={setR('passwordConfirm')} required />
                </div>

                {/* Activité */}
                <div>
                  <label className="form-label">Votre activité *</label>
                  <select className="form-input" value={reg.activity} onChange={setR('activity')} required>
                    {ACTIVITIES.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>

                {/* Type d'école (si étudiant) */}
                {isStudent && (
                  <div>
                    <label className="form-label">Type d'établissement *</label>
                    <select className="form-input" value={reg.schoolType} onChange={setR('schoolType')} required={isStudent}>
                      <option value="">-- Sélectionner --</option>
                      {SCHOOL_TYPES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {/* Objectif */}
                <div>
                  <label className="form-label">Votre objectif principal *</label>
                  <select className="form-input" value={reg.objective} onChange={setR('objective')} required>
                    {OBJECTIVES.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Tranche d'âge */}
                <div>
                  <label className="form-label">Tranche d'âge</label>
                  <select className="form-input" value={reg.ageRange} onChange={setR('ageRange')}>
                    {AGE_RANGES.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>

                {/* Comment avez-vous connu SportFin */}
                <div>
                  <label className="form-label">Comment avez-vous connu SportFin ?</label>
                  <select className="form-input" value={reg.howFound} onChange={setR('howFound')}>
                    {HOW_FOUND.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center mt-1 disabled:opacity-60"
              style={{ marginTop: 8 }}>
              {loading ? '…' : tab === 'login' ? 'Se connecter' : 'Créer mon compte gratuit →'}
            </button>

            {tab === 'login' && (
              <p className="text-center text-[12px] mt-2" style={{ color: 'var(--sf-muted)' }}>
                Pas encore de compte ?{' '}
                <button type="button" onClick={() => setTab('register')} className="font-semibold underline" style={{ color: 'var(--sf-primary)' }}>
                  S'inscrire gratuitement
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
