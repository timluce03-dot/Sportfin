import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

/* ─── Markdown renderer ──────────────────────────────────────────── */
function renderMd(text) {
  if (!text) return ''
  const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const isTableRow = l => /^\s*\|/.test(l) && l.includes('|')
  const isSeparator = l => /^\s*\|[\s\-:\|]+\|/.test(l)
  const parseCols = l => l.split('|').map(c => c.trim()).filter(Boolean)

  const lines = text.split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (isTableRow(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const headers = parseCols(escape(line))
      i += 2
      const rows = []
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(parseCols(escape(lines[i])))
        i++
      }
      const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`
      const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`
      blocks.push(`<table class="md-table">${thead}${tbody}</table>`)
      continue
    }
    blocks.push(escape(line))
    i++
  }
  return blocks.join('\n')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .split(/\n\n+/)
    .map(p => { p = p.trim(); if (!p) return ''; if (p.startsWith('<table')) return p; return `<p>${p.replace(/\n/g, '<br>')}</p>` })
    .join('')
}

/* ─── Markdown toolbar ───────────────────────────────────────────── */
function MdToolbar({ textareaRef, value, onChange }) {
  function wrap(before, after, placeholder) {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart, end = el.selectionEnd
    const selected = value.slice(start, end) || placeholder
    const next = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(next)
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }
  function insertTable() {
    const el = textareaRef.current
    if (!el) return
    const tpl = '\n\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|-----------|-----------|----------|\n| Valeur    | Valeur    | Valeur    |\n| Valeur    | Valeur    | Valeur    |\n\n'
    const pos = el.selectionEnd
    onChange(value.slice(0, pos) + tpl + value.slice(pos))
    setTimeout(() => el.focus(), 0)
  }
  const btn = (label, title, fn) => (
    <button key={label} type="button" title={title} onClick={fn}
      className="px-2.5 py-1 rounded-lg text-[12px] font-bold border transition-colors hover:bg-gray-100"
      style={{ borderColor: '#d1d5db', color: '#374151' }}>
      {label}
    </button>
  )
  return (
    <div className="flex gap-1.5 flex-wrap mb-1.5 px-2 py-1.5 rounded-lg" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
      {btn('G', 'Gras (Ctrl+B)', () => wrap('**', '**', 'texte en gras'))}
      {btn('I', 'Italique', () => wrap('*', '*', 'texte en italique'))}
      {btn('Tableau', 'Insérer un tableau', insertTable)}
      <span className="ml-2 text-[10.5px] self-center" style={{ color: '#9ca3af' }}>
        Markdown · **gras** · *italique* · | tableau |
      </span>
    </div>
  )
}

const LETTERS = ['A', 'B', 'C', 'D']

const CS_EMPTY = {
  title: '', subtitle: '', sector: '', context: '',
  time_easy: 35, time_intermediate: 20, time_expert: 12,
  key_takeaways: '', published: false, position: 0,
}

const M_EMPTY = {
  question: '', mission_type: 'qcm',
  opt_a: '', opt_b: '', opt_c: '', opt_d: '',
  is_multi: false, correct_index: 0, correct_indexes: [],
  accepted_answers: '', explanation: '', points: 1,
}

function missionToForm(m) {
  const opts = (() => { try { return JSON.parse(m.options || '[]') } catch { return [] } })()
  const aa = (() => {
    const v = m.accepted_answers
    if (Array.isArray(v)) return v.join(', ')
    try { return JSON.parse(v || '[]').join(', ') } catch { return '' }
  })()
  const ci = (() => {
    if (Array.isArray(m.correct_indexes)) return m.correct_indexes
    try { return JSON.parse(m.correct_indexes || '[]') } catch { return [] }
  })()
  return {
    question: m.question || '',
    mission_type: m.mission_type || 'qcm',
    opt_a: opts[0] || '', opt_b: opts[1] || '', opt_c: opts[2] || '', opt_d: opts[3] || '',
    is_multi: m.is_multi || false,
    correct_index: m.correct_index ?? 0,
    correct_indexes: ci,
    accepted_answers: aa,
    explanation: m.explanation || '',
    points: m.points || 1,
  }
}

function formToMissionPayload(f, caseStudyId, position) {
  if (f.mission_type === 'open') {
    const aa = f.accepted_answers.split(',').map(s => s.trim()).filter(Boolean)
    return {
      case_study_id: caseStudyId, question: f.question, mission_type: 'open',
      accepted_answers: JSON.stringify(aa),
      options: '[]', is_multi: false, correct_index: 0, correct_indexes: '[]',
      explanation: f.explanation, points: Number(f.points), position,
    }
  }
  return {
    case_study_id: caseStudyId, question: f.question, mission_type: 'qcm',
    options: JSON.stringify([f.opt_a, f.opt_b, f.opt_c, f.opt_d]),
    is_multi: f.is_multi,
    correct_index: f.is_multi ? (f.correct_indexes[0] ?? 0) : Number(f.correct_index),
    correct_indexes: f.is_multi ? JSON.stringify(f.correct_indexes) : '[]',
    accepted_answers: '[]',
    explanation: f.explanation, points: Number(f.points), position,
  }
}

/* ─── Mission Form ───────────────────────────────────────────────── */
function MissionForm({ caseStudyId, initialData, position, onSaved, onCancel }) {
  const [form, setForm] = useState(initialData ? missionToForm(initialData) : M_EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function save(e) {
    e.preventDefault(); setSaving(true); setErr('')
    const payload = formToMissionPayload(form, caseStudyId, initialData?.position ?? position)
    const op = initialData
      ? supabase.from('case_study_missions').update(payload).eq('id', initialData.id)
      : supabase.from('case_study_missions').insert(payload)
    const { error } = await op
    if (error) setErr(error.message)
    else onSaved()
    setSaving(false)
  }

  const isOpen = form.mission_type === 'open'

  return (
    <form onSubmit={save} className="bg-white border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--sf-muted)' }}>
          {initialData ? 'Modifier la mission' : 'Nouvelle mission'}
        </span>
      </div>

      {/* Type */}
      <div className="flex gap-2">
        {[['qcm', 'QCM'], ['open', 'Calcul / Réponse ouverte']].map(([v, l]) => (
          <button key={v} type="button" onClick={() => setForm(p => ({ ...p, mission_type: v }))}
            className={`px-4 py-2 rounded-xl text-[12.5px] font-bold border-2 transition-all ${form.mission_type === v ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-500'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Question */}
      <div>
        <label className="form-label">Énoncé de la mission *</label>
        <textarea className="form-input" rows={3} value={form.question} onChange={set('question')} required
          placeholder="Rédigez la mission / question posée à l'étudiant…" />
      </div>

      {isOpen ? (
        <div>
          <label className="form-label">Réponses acceptées <span className="font-normal text-gray-400">(séparées par des virgules)</span></label>
          <input className="form-input" value={form.accepted_answers} onChange={set('accepted_answers')}
            placeholder="7, 7 M€, 7m, 7 M" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {['a','b','c','d'].map((l, i) => (
              <div key={l}>
                <label className="form-label">Option {LETTERS[i]}</label>
                <input className="form-input" value={form[`opt_${l}`]} onChange={set(`opt_${l}`)} placeholder={`Option ${LETTERS[i]}`} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_multi} onChange={e => setForm(p => ({ ...p, is_multi: e.target.checked, correct_indexes: [] }))} />
              <span className="text-[13px] font-medium">Plusieurs bonnes réponses</span>
            </label>
          </div>

          {form.is_multi ? (
            <div>
              <label className="form-label">Bonnes réponses</label>
              <div className="flex gap-2">
                {LETTERS.map((l, i) => (
                  <button key={i} type="button"
                    onClick={() => setForm(p => ({
                      ...p,
                      correct_indexes: p.correct_indexes.includes(i)
                        ? p.correct_indexes.filter(x => x !== i)
                        : [...p.correct_indexes, i]
                    }))}
                    className={`w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all ${form.correct_indexes.includes(i) ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="form-label">Bonne réponse</label>
              <div className="flex gap-2">
                {LETTERS.map((l, i) => (
                  <button key={i} type="button" onClick={() => setForm(p => ({ ...p, correct_index: i }))}
                    className={`w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all ${form.correct_index === i ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Explication */}
      <div>
        <label className="form-label">Explication (affichée après correction)</label>
        <textarea className="form-input" rows={2} value={form.explanation} onChange={set('explanation')}
          placeholder="Explication du raisonnement attendu…" />
      </div>

      {/* Points */}
      <div style={{ maxWidth: 120 }}>
        <label className="form-label">Points</label>
        <input type="number" min="1" max="10" className="form-input" value={form.points} onChange={set('points')} />
      </div>

      {err && <p className="text-red-600 text-xs">{err}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving}
          className="btn btn-primary px-5 py-2 text-sm disabled:opacity-60">
          {saving ? '…' : initialData ? 'Enregistrer' : 'Ajouter la mission'}
        </button>
        <button type="button" onClick={onCancel}
          className="btn btn-ghost px-5 py-2 text-sm">Annuler</button>
      </div>
    </form>
  )
}

/* ─── Case Study Form ────────────────────────────────────────────── */
function CaseStudyForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || CS_EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [preview, setPreview] = useState(false)
  const contextRef = useRef(null)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function save(e) {
    e.preventDefault(); setSaving(true); setErr('')
    let takeaways
    try {
      const raw = form.key_takeaways
      if (Array.isArray(raw)) takeaways = raw
      else takeaways = raw.split('\n').map(s => s.trim()).filter(Boolean)
    } catch { takeaways = [] }

    const payload = {
      title: form.title, subtitle: form.subtitle, sector: form.sector,
      context: form.context,
      time_easy: Number(form.time_easy),
      time_intermediate: Number(form.time_intermediate),
      time_expert: Number(form.time_expert),
      key_takeaways: JSON.stringify(takeaways),
      published: form.published,
      position: Number(form.position),
    }
    const op = initial
      ? supabase.from('case_studies').update(payload).eq('id', initial.id)
      : supabase.from('case_studies').insert(payload)
    const { error } = await op
    if (error) setErr(error.message)
    else onSaved()
    setSaving(false)
  }

  const takeawaysStr = Array.isArray(form.key_takeaways)
    ? form.key_takeaways.join('\n')
    : (form.key_takeaways || '')

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Titre *</label>
          <input className="form-input" value={form.title} onChange={set('title')} required placeholder="Trading des Joueurs — Analyse d'une cession" />
        </div>
        <div>
          <label className="form-label">Secteur (ex : Football, Rugby…)</label>
          <input className="form-input" value={form.sector} onChange={set('sector')} placeholder="Football" />
        </div>
      </div>

      <div>
        <label className="form-label">Sous-titre</label>
        <input className="form-input" value={form.subtitle} onChange={set('subtitle')} placeholder="Bref descriptif du cas…" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="form-label mb-0">Brief / Énoncé complet du cas *</label>
          <button type="button" onClick={() => setPreview(p => !p)}
            className="text-[11.5px] font-semibold px-3 py-1 rounded-lg transition-colors"
            style={{ background: preview ? 'var(--sf-primary)' : '#f3f4f6', color: preview ? '#fff' : '#374151' }}>
            {preview ? '✎ Éditer' : '👁 Aperçu'}
          </button>
        </div>
        {!preview ? (
          <>
            <MdToolbar textareaRef={contextRef} value={form.context} onChange={v => setForm(p => ({ ...p, context: v }))} />
            <textarea ref={contextRef} className="form-input font-mono text-[13px]" rows={16}
              value={form.context} onChange={set('context')} required
              placeholder="Rédigez le dossier complet. Utilisez **gras**, *italique*, et le bouton Tableau pour insérer un tableau depuis ChatGPT/Claude." />
          </>
        ) : (
          <style>{`.md-table{width:100%;border-collapse:collapse;margin:10px 0;font-size:13px}.md-table th{background:#0B2545;color:#fff;font-weight:700;padding:8px 12px;text-align:left}.md-table td{padding:7px 12px;border-bottom:1px solid #e5e7eb}.md-table tr:last-child td{border-bottom:none}.md-table tr:nth-child(even) td{background:#f9fafb}`}</style>
          <div className="rounded-xl border px-6 py-5 text-[13.5px] leading-relaxed min-h-[200px]"
            style={{ borderColor: 'var(--sf-border)', background: '#fff', color: 'var(--sf-text)' }}
            dangerouslySetInnerHTML={{ __html: renderMd(form.context) }} />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[['time_easy','Accessible (min)'],['time_intermediate','Intermédiaire (min)'],['time_expert','Expert (min)']].map(([k,l]) => (
          <div key={k}>
            <label className="form-label">{l}</label>
            <input type="number" min="1" className="form-input" value={form[k]} onChange={set(k)} />
          </div>
        ))}
      </div>

      <div>
        <label className="form-label">Points clés à retenir <span className="font-normal text-gray-400">(un point par ligne — affichés dans la correction)</span></label>
        <textarea className="form-input" rows={4} value={takeawaysStr}
          onChange={e => setForm(p => ({ ...p, key_takeaways: e.target.value }))}
          placeholder={"La VNC est le seul critère pertinent pour calculer le gain\nLe produit net = prix de cession − coûts directement liés"} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Position</label>
          <input type="number" className="form-input" value={form.position} onChange={set('position')} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm(p => ({ ...p, published: e.target.checked }))} />
            <span className="text-[13px] font-medium">Publié</span>
          </label>
        </div>
      </div>

      {err && <p className="text-red-600 text-xs">{err}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
          {saving ? '…' : initial ? 'Enregistrer les modifications' : 'Créer le cas'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost px-6 py-2.5 text-sm">Annuler</button>
      </div>
    </form>
  )
}

/* ─── Case Study Row ─────────────────────────────────────────────── */
function CaseStudyRow({ cs, onRefresh }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [addingMission, setAddingMission] = useState(false)
  const [editingMission, setEditingMission] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const missions = cs.case_study_missions || []

  async function deleteCs() {
    if (!confirm(`Supprimer "${cs.title}" et toutes ses missions ?`)) return
    setDeleting(true)
    await supabase.from('case_study_missions').delete().eq('case_study_id', cs.id)
    await supabase.from('case_studies').delete().eq('id', cs.id)
    onRefresh()
  }

  async function deleteMission(id) {
    if (!confirm('Supprimer cette mission ?')) return
    await supabase.from('case_study_missions').delete().eq('id', id)
    onRefresh()
  }

  async function moveMission(mission, dir) {
    const sorted = [...missions].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(m => m.id === mission.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx], b = sorted[swapIdx]
    await Promise.all([
      supabase.from('case_study_missions').update({ position: b.position }).eq('id', a.id),
      supabase.from('case_study_missions').update({ position: a.position }).eq('id', b.id),
    ])
    onRefresh()
  }

  async function togglePublish() {
    await supabase.from('case_studies').update({ published: !cs.published }).eq('id', cs.id)
    onRefresh()
  }

  if (editing) return (
    <div className="bg-white border rounded-2xl p-6">
      <p className="font-bold text-[13px] mb-4" style={{ color: 'var(--sf-primary)' }}>Modifier le cas</p>
      <CaseStudyForm initial={cs} onSaved={() => { setEditing(false); onRefresh() }} onCancel={() => setEditing(false)} />
    </div>
  )

  return (
    <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--sf-border)' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
        <button onClick={() => setOpen(!open)} className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[14px]" style={{ color: 'var(--sf-text)' }}>{cs.title}</span>
            {cs.sector && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(11,37,69,.08)', color: 'var(--sf-primary)' }}>{cs.sector}</span>}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cs.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {cs.published ? 'Publié' : 'Brouillon'}
            </span>
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: 'var(--sf-muted)' }}>
            {missions.length} mission{missions.length !== 1 ? 's' : ''} · {cs.time_easy}/{cs.time_intermediate}/{cs.time_expert} min
          </div>
        </button>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={togglePublish}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${cs.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {cs.published ? '● Publié' : '○ Publier'}
          </button>
          <button onClick={() => setEditing(true)} className="text-blue-600 hover:text-blue-800 font-semibold text-[12px]">Modifier</button>
          <button onClick={deleteCs} disabled={deleting} className="text-red-500 hover:text-red-700 font-semibold text-[12px]">Supprimer</button>
        </div>
      </div>

      {/* Missions panel */}
      {open && (
        <div className="border-t px-5 py-5 space-y-3" style={{ borderColor: 'var(--sf-border)', background: '#f9fafb' }}>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--sf-muted)' }}>
              Missions ({missions.length})
            </span>
            {!addingMission && (
              <button onClick={() => { setAddingMission(true); setEditingMission(null) }}
                className="btn btn-primary text-xs px-4 py-1.5">+ Ajouter une mission</button>
            )}
          </div>

          {addingMission && (
            <MissionForm
              caseStudyId={cs.id}
              position={missions.length}
              onSaved={() => { setAddingMission(false); onRefresh() }}
              onCancel={() => setAddingMission(false)}
            />
          )}

          {missions.map((m, i) => (
            editingMission?.id === m.id ? (
              <MissionForm key={m.id} caseStudyId={cs.id} initialData={m}
                onSaved={() => { setEditingMission(null); onRefresh() }}
                onCancel={() => setEditingMission(null)} />
            ) : (
              <div key={m.id} className="bg-white border rounded-xl px-4 py-3 flex items-start gap-3" style={{ borderColor: 'var(--sf-border)' }}>
                <span className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-extrabold text-white mt-0.5"
                  style={{ background: 'var(--sf-primary)' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--sf-text)' }}>{m.question}</p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--sf-muted)' }}>
                    {m.mission_type === 'open' ? 'Réponse ouverte' : m.is_multi ? 'QCM — plusieurs réponses' : 'QCM'} · {m.points} pt{m.points > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => moveMission(m, -1)} className="text-gray-400 hover:text-gray-600 text-[14px] px-1">↑</button>
                  <button onClick={() => moveMission(m, 1)} className="text-gray-400 hover:text-gray-600 text-[14px] px-1">↓</button>
                  <button onClick={() => { setEditingMission(m); setAddingMission(false) }}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-[12px]">Modifier</button>
                  <button onClick={() => deleteMission(m.id)}
                    className="text-red-500 hover:text-red-700 font-semibold text-[12px]">✕</button>
                </div>
              </div>
            )
          ))}

          {missions.length === 0 && !addingMission && (
            <p className="text-center text-[13px] py-4" style={{ color: 'var(--sf-muted)' }}>Aucune mission pour l'instant.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function AdminCaseStudies() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('case_studies')
      .select('*, case_study_missions(*)')
      .order('position')
    if (data) data.forEach(cs => cs.case_study_missions?.sort((a, b) => a.position - b.position))
    setCases(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-[900px]">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-serif font-extrabold" style={{ color: 'var(--sf-text)' }}>Études de cas</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--sf-muted)' }}>
            Cas d'entretien interactifs avec timer, auto-correction et points clés.
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary px-5 py-2.5 text-sm">+ Nouveau cas</button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border rounded-2xl p-6 mb-6" style={{ borderColor: 'var(--sf-border)' }}>
          <p className="font-bold text-[13px] mb-4" style={{ color: 'var(--sf-primary)' }}>Créer un nouveau cas</p>
          <CaseStudyForm
            onSaved={() => { setShowForm(false); load() }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--sf-muted)' }}>
          <div className="text-5xl mb-4">🎯</div>
          <p className="font-semibold text-lg">Aucun cas créé</p>
          <p className="text-[13px] mt-1">Créez votre premier cas d'entretien ci-dessus.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map(cs => <CaseStudyRow key={cs.id} cs={cs} onRefresh={load} />)}
        </div>
      )}
    </div>
  )
}
