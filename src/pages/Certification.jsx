import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCertificationLevels, getCertificationBrands } from '../services/certificationService'
import PartnersScrollBanner from '../components/PartnersScrollBanner'

const LEVEL_GRADIENTS = [
  'linear-gradient(135deg, #1B4F8A, #0B2545)',
  'linear-gradient(135deg, #0B2545, #050f1f)',
  'linear-gradient(135deg, #8B6914, #C9A84C)',
]

const VALUE_PROPS = [
  {
    metric: '+50%',
    title: 'de chances d\'être sélectionné',
    desc: 'Les candidats certifiés SPORTFIN voient leur CV sélectionné deux fois plus souvent parmi les candidatures reçues par les recruteurs du secteur sport.',
    icon: '📄',
  },
  {
    metric: 'Badge LinkedIn',
    title: 'officiel et vérifiable',
    desc: 'Ajoutez votre certification directement à votre profil LinkedIn. Un signal fort, visible par les recruteurs qui consultent votre profil.',
    icon: (
      <div className="relative mx-auto w-16 h-16 mb-3">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-black text-2xl"
          style={{ background: '#0077B5' }}>in</div>
        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
          style={{ background: 'var(--sf-accent)' }}>✓</div>
      </div>
    ),
    isNode: true,
  },
  {
    metric: '3 niveaux',
    title: 'reconnus par les employeurs',
    desc: 'Les clubs, ligues, agences et médias partenaires intègrent la certification SPORTFIN dans leurs grilles de sélection pour les stages et CDI.',
    icon: '🏆',
  },
]

function LevelCard({ level, idx, total }) {
  const grad     = LEVEL_GRADIENTS[idx % LEVEL_GRADIENTS.length]
  const featured = total === 3 && idx === 1
  const lines    = (level.description || '').split('\n').filter(Boolean)

  return (
    <div
      className={`rounded-2xl p-7 text-white flex flex-col relative overflow-hidden ${featured ? 'ring-2 ring-white/30 scale-[1.03]' : ''}`}
      style={{ background: grad }}
    >
      {featured && (
        <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>
          LE PLUS POPULAIRE
        </div>
      )}
      <div className="mb-1">
        <span className="font-serif text-3xl font-extrabold leading-none">{level.name}</span>
        {level.badge && <span className="ml-1 font-serif text-3xl font-extrabold leading-none opacity-60">{level.badge}</span>}
      </div>
      {level.tagline && (
        <div className="text-[11px] font-semibold tracking-wide opacity-60 uppercase mb-4">{level.tagline}</div>
      )}

      {lines.length > 0 ? (
        <ul className="space-y-2 mb-5 flex-1">
          {lines.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-[12.5px] opacity-80">
              <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--sf-accent)' }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex gap-4 text-[11px] opacity-55 mb-5 flex-wrap">
        {level.duration && <span>⏱ {level.duration}</span>}
        {level.price != null && (
          <span>💳 {level.price === 0 ? 'Inclus Premium' : `${level.price}€`}</span>
        )}
      </div>

      <Link to="/tarifs"
        className="btn btn-sm justify-center"
        style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }}>
        Voir l'offre →
      </Link>
    </div>
  )
}

export default function Certification() {
  const [levels,        setLevels]        = useState([])
  const [brands,        setBrands]        = useState([])
  const [levelsErr,     setLevelsErr]     = useState(null)
  const [loadingLevels, setLoadingLevels] = useState(true)

  useEffect(() => {
    getCertificationLevels().then(({ data, error }) => {
      setLevels(data)
      setLevelsErr(error)
      setLoadingLevels(false)
    })
    getCertificationBrands().then(({ data }) => {
      setBrands(data)
    })
  }, [])

  const brandNames = brands.map(b => b.name)

  return (
    <div className="pt-[64px]">

      {/* ── Hero ── */}
      <section style={{ background: 'var(--sf-primary)' }} className="px-6 lg:px-10 py-16 text-center">
        <div className="max-w-[1360px] mx-auto">
          <span className="eyebrow" style={{ color: 'rgba(201,168,76,.8)' }}>Certification officielle</span>
          <h1 className="font-serif text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-4">
            Sport Business Maker<br />
            <span style={{ color: 'var(--sf-accent)' }}>La certification qui fait la différence</span>
          </h1>
          <p className="text-white/60 text-[15px] max-w-lg mx-auto mb-8 leading-relaxed">
            Reconnue par les employeurs du secteur sport, valorisable sur LinkedIn et votre CV.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/tarifs" className="btn btn-accent btn-lg">Je me certifie →</Link>
            <Link to="/cours" className="btn btn-white btn-lg">Voir le programme</Link>
          </div>
        </div>
      </section>

      {/* ── Partners logos banner ── */}
      <PartnersScrollBanner title="Reconnue et valorisée par les leaders du sport" />

      {/* ── Value props ── */}
      <section className="max-w-[1360px] mx-auto px-6 lg:px-10 py-16">
        <div className="text-center mb-12">
          <span className="eyebrow">Pourquoi se certifier ?</span>
          <h2 className="section-title">Un avantage concurrentiel réel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {VALUE_PROPS.map((vp, i) => (
            <div key={i} className="card p-8 text-center flex flex-col items-center">
              {vp.isNode ? vp.icon : <div className="text-4xl mb-3">{vp.icon}</div>}
              <div className="font-serif text-4xl font-extrabold mb-1" style={{ color: 'var(--sf-primary)' }}>{vp.metric}</div>
              <div className="text-[13.5px] font-bold mb-2" style={{ color: 'var(--sf-text)' }}>{vp.title}</div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--sf-muted)' }}>{vp.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Employer testimony ── */}
        <div className="rounded-2xl p-8 mb-16 text-center" style={{ background: 'rgba(11,37,69,.04)', border: '1px solid var(--sf-border)' }}>
          <div className="font-serif text-3xl font-black mb-4" style={{ color: 'var(--sf-accent)' }}>"</div>
          <p className="font-serif text-[17px] italic leading-relaxed mb-5 max-w-[620px] mx-auto" style={{ color: 'var(--sf-text)' }}>
            J'avais deux candidats à compétences égales. Celui certifié SPORTFIN montrait une vraie culture du secteur, une rigueur que l'autre n'avait pas. Il a eu le poste.
          </p>
          <div className="text-[13px] font-semibold" style={{ color: 'var(--sf-primary)' }}>Charlotte R.</div>
          <div className="text-[12px]" style={{ color: 'var(--sf-muted)' }}>Directrice RH, Fédération Française de Football</div>
        </div>

        {/* ── Levels ── */}
        <div className="text-center mb-9">
          <span className="eyebrow">3 niveaux progressifs</span>
          <h2 className="section-title">Progressez à votre rythme</h2>
        </div>

        {loadingLevels ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {[1,2,3].map(i => <div key={i} className="h-64 skeleton rounded-2xl" />)}
          </div>
        ) : levelsErr ? (
          <div className="text-center py-12 mb-14">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-[13px] font-medium mb-1" style={{ color: '#991b1b' }}>Impossible de charger les niveaux</p>
            <p className="text-[12px]" style={{ color: '#b91c1c' }}>{levelsErr}</p>
          </div>
        ) : levels.length === 0 ? (
          <div className="text-center py-12 mb-14">
            <p className="text-[14px]" style={{ color: 'var(--sf-muted)' }}>Les niveaux de certification seront disponibles prochainement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {levels.map((level, idx) => (
              <LevelCard key={level.id} level={level} idx={idx} total={levels.length} />
            ))}
          </div>
        )}

        {/* ── Stats bottom ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ['94%', 'de taux de réussite à la certification'],
            ['+50%', 'de chances de sélection CV'],
            ['3 000+', 'certifiés sur la plateforme'],
            ['87%', 'de nos certifiés ont trouvé un poste en < 6 mois'],
          ].map(([n, l]) => (
            <div key={l} className="text-center p-5 rounded-2xl" style={{ background: 'var(--sf-surface)', border: '1px solid var(--sf-border)' }}>
              <div className="font-serif text-3xl font-extrabold mb-1" style={{ color: 'var(--sf-primary)' }}>{n}</div>
              <div className="text-[12px] leading-snug" style={{ color: 'var(--sf-muted)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
