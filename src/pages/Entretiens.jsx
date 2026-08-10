import { useState } from 'react'
import { SECTORS } from '../data/entretiens.js'

function Question({ q, index }) {
  const [open, setOpen] = useState(false)
  const DIFF = { Débutant: 'badge-success', Intermédiaire: 'badge-primary', Avancé: 'badge-danger' }

  return (
    <div className="card mb-3">
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setOpen(!open)}>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: 'rgba(11,37,69,.08)', color: 'var(--sf-primary)' }}>
          {String(index).padStart(2,'0')}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-snug" style={{ color: 'var(--sf-text)' }}>{q.q}</div>
        </div>
        <span className={`badge ${DIFF[q.difficulty]||'badge-muted'} flex-shrink-0 hidden sm:inline-flex`}>{q.difficulty}</span>
        <span className="text-gray-400 ml-2 flex-shrink-0 transition-transform" style={{ transform: open?'rotate(180deg)':'rotate(0)' }}>▾</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: 'var(--sf-border)' }}>
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-500 text-base">💡</span>
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sf-primary)' }}>Comment répondre</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--sf-muted)' }}>{q.conseil}</p>
          </div>
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-500 text-base">⚠️</span>
              <span className="text-xs font-bold uppercase tracking-wide text-red-600">Pièges à éviter</span>
            </div>
            <p className="text-sm leading-relaxed text-red-700">{q.pieges}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Entretiens() {
  const [sectorId, setSectorId] = useState(null)
  const sector = SECTORS.find(s => s.id === sectorId)

  return (
    <div className="pt-[64px]">
      {/* Hero */}
      <section style={{ background: 'var(--sf-primary)' }} className="px-6 py-14">
        <div className="max-w-[1360px] mx-auto">
          <span className="eyebrow text-white/50">Préparation aux entretiens</span>
          <h1 className="font-serif text-3xl lg:text-4xl font-extrabold text-white mb-3">
            Réussissez votre entretien<br />
            <span style={{ color: 'var(--sf-accent)' }}>dans le sport business</span>
          </h1>
          <p className="text-white/65 max-w-lg leading-relaxed">
            Des dizaines de questions types, conseils de réponse et pièges à éviter — organisés par secteur précis, pour une préparation ciblée et efficace.
          </p>
        </div>
      </section>

      <div className="max-w-[1360px] mx-auto px-6 py-10">
        {/* Sector selector */}
        <div className="mb-10">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--sf-muted)' }}>
            {sectorId ? '← Choisir un autre secteur' : 'Choisissez votre secteur'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SECTORS.map(s => (
              <button key={s.id} onClick={() => setSectorId(s.id === sectorId ? null : s.id)}
                className={`card card-hover p-4 text-left transition-all ${s.id===sectorId?'ring-2':'hover:border-primary/30'}`}
                style={s.id===sectorId?{borderColor:'var(--sf-accent)',boxShadow:'0 0 0 2px var(--sf-accent)'}:{}}>
                <span className="text-2xl mb-2 block">{s.icon}</span>
                <div className="text-xs font-bold leading-tight" style={{ color: 'var(--sf-text)' }}>{s.label}</div>
                <div className="text-[10px] mt-1 leading-snug" style={{ color: 'var(--sf-muted)' }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sector content */}
        {sector && (
          <div>
            {/* Tips */}
            <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(11,37,69,.04)', border: '1px solid var(--sf-border)' }}>
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--sf-primary)' }}>
                <span className="text-xl">{sector.icon}</span>
                Conseils clés — {sector.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sector.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--sf-accent)', color: '#3D2B00' }}>{i+1}</span>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--sf-muted)' }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl font-bold" style={{ color: 'var(--sf-text)' }}>
                {sector.questions.length} questions types
              </h3>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--sf-muted)' }}>
                <span className="badge badge-success">Débutant</span>
                <span className="badge badge-primary">Intermédiaire</span>
                <span className="badge badge-danger">Avancé</span>
              </div>
            </div>
            <div>
              {sector.questions.map((q, i) => (
                <Question key={q.id} q={q} index={i+1} />
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: 'var(--sf-primary)' }}>
              <div className="text-white font-semibold mb-1">Prêt(e) pour votre entretien ?</div>
              <p className="text-white/60 text-sm mb-4">Renforcez vos bases avec nos cours thématiques et testez-vous avec les quiz.</p>
              <div className="flex gap-3 justify-center">
                <a href="/cours" className="btn btn-accent btn-sm">Voir les cours →</a>
                <a href="/quiz" className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}>Faire un quiz</a>
              </div>
            </div>
          </div>
        )}

        {!sectorId && (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">♟️</div>
            <p className="font-semibold text-base mb-1" style={{ color: 'var(--sf-text)' }}>Sélectionnez un secteur ci-dessus</p>
            <p className="text-sm" style={{ color: 'var(--sf-muted)' }}>Chaque secteur contient des questions types, conseils et pièges spécifiques.</p>
          </div>
        )}
      </div>
    </div>
  )
}
