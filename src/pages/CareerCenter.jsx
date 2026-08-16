import { useState, useEffect } from 'react'
import { getJobs } from '../services/jobsService'
import CareerMetiersBanner from '../components/CareerMetiersBanner'

const CONTRACT_STYLE = {
  CDI:    { bg: 'rgba(16,185,129,.1)', color: '#065f46' },
  CDD:    { bg: 'rgba(245,158,11,.1)', color: '#92400e' },
  Stage:  { bg: 'rgba(11,37,69,.09)', color: '#0B2545' },
  Interim:{ bg: 'rgba(139,92,246,.1)', color: '#5b21b6' },
}

const CONTRACTS = ['Tous', 'CDI', 'CDD', 'Stage', 'Interim']

function JobCard({ job }) {
  const badge = CONTRACT_STYLE[job.contract] || { bg: 'rgba(0,0,0,.06)', color: 'var(--sf-muted)' }
  return (
    <div className="card card-hover p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          {job.img
            ? <img src={job.img} alt={job.company} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white text-[13px] font-black"
                style={{ background: 'var(--sf-primary)' }}>{job.company[0]}</div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-0.5" style={{ color: 'var(--sf-muted)' }}>{job.company}</p>
          <h3 className="text-[13.5px] font-bold leading-snug" style={{ color: 'var(--sf-text)', fontFamily: 'var(--sf-font-heading)' }}>{job.title}</h3>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: 'var(--sf-muted)' }}>{job.description}</p>

      <div className="flex flex-wrap gap-1.5">
        <span className="badge text-[10.5px]" style={{ background: badge.bg, color: badge.color }}>{job.contract}</span>
        {job.location && <span className="badge badge-muted text-[10.5px]">📍 {job.location}</span>}
        {job.domain   && <span className="badge badge-muted text-[10.5px]">{job.domain}</span>}
      </div>

      <div className="flex items-center justify-between pt-2 border-t mt-auto" style={{ borderColor: 'var(--sf-border)' }}>
        <span className="text-[11px]" style={{ color: 'var(--sf-muted)' }}>Disponible</span>
        {job.apply_url
          ? <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Postuler →</a>
          : <button className="btn btn-primary btn-sm">Postuler →</button>
        }
      </div>
    </div>
  )
}

export default function CareerCenter() {
  const [jobs,     setJobs]     = useState([])
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [domain,   setDomain]   = useState('Tous')
  const [contract, setContract] = useState('Tous')
  const [location, setLocation] = useState('Toutes villes')
  const [search,   setSearch]   = useState('')

  function load() {
    setLoading(true); setError(null)
    getJobs().then(({ data, error }) => { setJobs(data); setError(error); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const domains   = ['Tous', ...Array.from(new Set(jobs.map(j => j.domain).filter(Boolean))).sort()]
  const locations = ['Toutes villes', ...Array.from(new Set(jobs.map(j => j.location).filter(Boolean))).sort()]

  const filtered = jobs.filter(j =>
    (domain   === 'Tous'          || j.domain   === domain) &&
    (contract === 'Tous'          || j.contract === contract) &&
    (location === 'Toutes villes' || j.location === location) &&
    (!search || j.title.toLowerCase().includes(search.toLowerCase()) ||
                j.company.toLowerCase().includes(search.toLowerCase()))
  )

  const hasFilters = domain !== 'Tous' || contract !== 'Tous' || location !== 'Toutes villes' || search

  return (
    <div className="pt-[64px]">

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(155deg, #071a32 0%, var(--sf-primary) 55%, #163b6b 100%)' }} className="px-6 lg:px-10 py-12">
        <div className="max-w-[1360px] mx-auto text-center">
          <span className="eyebrow flex justify-center" style={{ color: 'rgba(201,168,76,.8)' }}>Opportunités</span>
          <h1 className="font-serif font-extrabold text-white mb-3 leading-tight"
            style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}>
            Career Center <span style={{ color: 'var(--sf-accent)' }}>Sport Business</span>
          </h1>
          <p className="max-w-xl mx-auto leading-relaxed mb-7 text-[14px]" style={{ color: 'rgba(255,255,255,.6)' }}>
            Les meilleures opportunités de carrière dans le sport business — clubs, ligues, agences, médias, conseil.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[13px]">🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Poste, entreprise…"
                className="pl-9 pr-4 py-2.5 rounded-xl text-[13.5px] font-medium min-w-[220px] focus:outline-none placeholder:text-white/40 text-white"
                style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)' }}
              />
            </div>
            <select value={contract} onChange={e => setContract(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-[13.5px] font-medium focus:outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', minWidth: 155 }}>
              {CONTRACTS.map(c => <option key={c} className="text-gray-900 bg-white">{c}</option>)}
            </select>
            <select value={domain} onChange={e => setDomain(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-[13.5px] font-medium focus:outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', minWidth: 155 }}>
              {domains.map(d => <option key={d} className="text-gray-900 bg-white">{d}</option>)}
            </select>
            <select value={location} onChange={e => setLocation(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-[13.5px] font-medium focus:outline-none cursor-pointer"
              style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', minWidth: 155 }}>
              {locations.map(l => <option key={l} className="text-gray-900 bg-white">{l}</option>)}
            </select>
            {hasFilters && (
              <button
                onClick={() => { setDomain('Tous'); setContract('Tous'); setLocation('Toutes villes'); setSearch('') }}
                className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,.1)' }}>
                ✕ Réinitialiser
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Métiers banner ── */}
      <CareerMetiersBanner />

      {/* ── Results ── */}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-semibold text-[15px] mb-1" style={{ color: '#991b1b' }}>Erreur de chargement</p>
            <p className="text-[13px] mb-4" style={{ color: '#b91c1c' }}>{error}</p>
            <button onClick={load} className="btn btn-outline btn-sm">Réessayer</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-7">
              <p className="text-[13.5px] font-medium" style={{ color: 'var(--sf-muted)' }}>
                <span className="font-bold text-[15px]" style={{ color: 'var(--sf-primary)' }}>{filtered.length}</span>
                {' '}offre{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
              </p>
              <span className="badge badge-muted text-[11px]">Mis à jour régulièrement</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-3">{jobs.length === 0 ? '💼' : '🔍'}</div>
                <p className="font-semibold mb-1" style={{ color: 'var(--sf-text)' }}>
                  {jobs.length === 0 ? 'Aucune offre publiée pour le moment' : 'Aucune offre trouvée'}
                </p>
                <p className="text-[13px]" style={{ color: 'var(--sf-muted)' }}>
                  {jobs.length === 0 ? 'Revenez prochainement pour découvrir nos opportunités.' : 'Essayez d\'élargir vos critères.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-12">
                {filtered.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </>
        )}

        {/* Recruiter CTA */}
        <div className="rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-5 mt-8"
          style={{ background: 'rgba(11,37,69,.04)', border: '1px solid var(--sf-border)' }}>
          <div>
            <p className="font-bold text-[14.5px] mb-1" style={{ color: 'var(--sf-primary)' }}>💼 Vous recrutez dans le sport business ?</p>
            <p className="text-[13px]" style={{ color: 'var(--sf-muted)' }}>Publiez vos offres et accédez à 4 500+ talents formés aux spécificités du secteur.</p>
          </div>
          <a href="mailto:contact@sportfin.fr" className="btn btn-primary flex-shrink-0">Nous contacter →</a>
        </div>
      </div>
    </div>
  )
}
