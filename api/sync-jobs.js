import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const KEYWORDS = ['sport', 'football', 'rugby', 'basketball', 'tennis', 'handball', 'natation', 'athlétisme', 'sport business', 'directeur sportif', 'manager sport']

const CONTRACT_MAP = {
  CDI: 'CDI',
  CDD: 'CDD',
  MIS: 'Interim',
  SAI: 'CDD',
  STG: 'Stage',
  LIB: 'CDI',
}

async function getToken() {
  const res = await fetch(
    'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.FRANCE_TRAVAIL_CLIENT_ID,
        client_secret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET,
        scope: 'api_offresdemploiv2 o2dsoffre',
      }),
    }
  )
  const json = await res.json()
  return json.access_token
}

async function fetchJobs(token, keyword) {
  const res = await fetch(
    `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?motsCles=${encodeURIComponent(keyword)}&range=0-49`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  )
  if (!res.ok) return []
  const json = await res.json()
  return json.resultats || []
}

export default async function handler(req, res) {
  try {
    const token = await getToken()
    if (!token) return res.status(500).json({ error: 'Token France Travail introuvable' })

    const allJobs = []
    for (const keyword of KEYWORDS) {
      const results = await fetchJobs(token, keyword)
      allJobs.push(...results)
    }

    // Déduplique par ID France Travail
    const seen = new Set()
    const unique = allJobs.filter(j => {
      if (!j.id || seen.has(j.id)) return false
      seen.add(j.id)
      return true
    })

    // Transforme en format Supabase
    const rows = unique.map(j => ({
      title: j.intitule || 'Poste non précisé',
      company: j.entreprise?.nom || 'Entreprise non précisée',
      description: (j.description || '').slice(0, 600),
      contract: CONTRACT_MAP[j.typeContrat] || 'CDI',
      location: j.lieuTravail?.libelle || '',
      domain: 'Sport',
      apply_url: j.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${j.id}`,
      published: true,
      external_id: j.id,
      source: 'france_travail',
    }))

    // Upsert dans Supabase
    const { error } = await supabase
      .from('jobs')
      .upsert(rows, { onConflict: 'external_id' })

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ success: true, synced: rows.length })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
