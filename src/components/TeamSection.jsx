import { useState, useEffect } from 'react'
import { getTeamMembers } from '../services/teamService'

function TeamCard({ m }) {
  return (
    <div className="relative rounded-2xl overflow-hidden group cursor-default"
      style={{ aspectRatio: '3/4', boxShadow: '0 8px 32px rgba(0,0,0,.32)' }}>

      {/* Photo */}
      {m.photo_url
        ? <img src={m.photo_url} alt={`${m.first_name} ${m.last_name}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        : <div className="absolute inset-0 w-full h-full flex items-center justify-center text-5xl font-black text-white/30"
            style={{ background: 'linear-gradient(160deg,#0B2545,#163b6b)' }}>
            {m.first_name[0]}{m.last_name[0]}
          </div>
      }

      {/* Always-visible bottom strip — name */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 z-10 transition-opacity duration-300 group-hover:opacity-0"
        style={{ background: 'linear-gradient(to top, rgba(7,26,50,.92) 60%, transparent)' }}>
        <p className="text-white font-bold text-[14px] leading-tight">
          {m.first_name} <span style={{ color: 'var(--sf-accent)' }}>{m.last_name}</span>
        </p>
        {m.role && <p className="text-white/60 text-[11px] mt-0.5 font-medium">{m.role}</p>}
      </div>

      {/* Hover overlay — bio */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end px-5 pb-5 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to top, rgba(7,26,50,.97) 55%, rgba(7,26,50,.7) 100%)' }}>
        <p className="text-white font-bold text-[15px] leading-tight mb-0.5">
          {m.first_name} <span style={{ color: 'var(--sf-accent)' }}>{m.last_name}</span>
        </p>
        {m.role && <p className="text-[11px] font-semibold mb-3" style={{ color: 'var(--sf-accent)' }}>{m.role}</p>}
        {m.bio && (
          <p className="text-white/75 text-[12px] leading-relaxed line-clamp-6">{m.bio}</p>
        )}
      </div>
    </div>
  )
}

export default function TeamSection() {
  const [members, setMembers] = useState([])

  useEffect(() => {
    getTeamMembers().then(({ data }) => setMembers(data))
  }, [])

  if (members.length === 0) return null

  return (
    <section style={{ background: 'linear-gradient(165deg, #071a32 0%, #0B2545 50%, #0d2d57 100%)' }}
      className="py-16 px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[10px] font-bold tracking-[.22em] uppercase mb-3 px-3 py-1 rounded-full"
            style={{ color: 'var(--sf-accent)', background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.25)' }}>
            Notre équipe
          </span>
          <h2 className="font-serif font-extrabold text-white leading-tight"
            style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}>
            Les experts derrière<br />
            <span style={{ color: 'var(--sf-accent)' }}>SportFin</span>
          </h2>
          <p className="text-white/50 text-[14px] mt-3 max-w-md mx-auto">
            Passez la souris sur un profil pour en savoir plus
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {members.map(m => <TeamCard key={m.id} m={m} />)}
        </div>
      </div>
    </section>
  )
}
