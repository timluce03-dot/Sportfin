import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const KEYWORDS = ['sport', 'football', 'rugby', 'basketball', 'tennis', 'handball', 'natation', 'athlétisme', 'sport business', 'directeur sportif', 'manager sport']
const ADZUNA_KEYWORDS = ['sport', 'football', 'rugby', 'basketball', 'sport business', 'manager sport']

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

async function fetchAdzunaJobs(keyword) {
  const appId  = process.env.ADZUNA_APP_ID
  const apiKey = process.env.ADZUNA_API_KEY
  if (!appId || !apiKey) return []
  const url = `https://api.adzuna.com/v1/api/jobs/fr/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=50&what=${encodeURIComponent(keyword)}&content-type=application/json`
  const res = await fetch(url)
  if (!res.ok) return []
  const json = await res.json()
  return json.results || []
}

export default async function handler(req, res) {
  try {
    const allJobs = []

    // ── France Travail ──
    const token = await getToken()
    if (token) {
      for (const keyword of KEYWORDS) {
        const results = await fetchJobs(token, keyword)
        allJobs.push(...results.map(j => ({
          title: j.intitule || 'Poste non précisé',
          company: j.entreprise?.nom || 'Entreprise non précisée',
          description: (j.description || '').slice(0, 600),
          contract: CONTRACT_MAP[j.typeContrat] || 'CDI',
          location: j.lieuTravail?.libelle || '',
          domain: 'Sport',
          apply_url: j.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${j.id}`,
          published: true,
          external_id: `ft_${j.id}`,
          source: 'france_travail',
        })))
      }
    }

    // ── Adzuna ──
    for (const keyword of ADZUNA_KEYWORDS) {
      const results = await fetchAdzunaJobs(keyword)
      allJobs.push(...results.map(j => ({
        title: j.title || 'Poste non précisé',
        company: j.company?.display_name || 'Entreprise non précisée',
        description: (j.description || '').slice(0, 600),
        contract: j.contract_time === 'full_time' ? 'CDI' : j.contract_time === 'part_time' ? 'CDD' : 'CDI',
        location: j.location?.display_name || '',
        domain: 'Sport',
        apply_url: j.redirect_url || '',
        published: true,
        external_id: `az_${j.id}`,
        source: 'adzuna',
      })))
    }

    // Déduplique par external_id
    const seen = new Set()
    const unique = allJobs.filter(j => {
      if (!j.external_id || seen.has(j.external_id)) return false
      seen.add(j.external_id)
      return true
    })

    // Upsert dans Supabase
    const { error } = await supabase
      .from('jobs')
      .upsert(unique, { onConflict: 'external_id' })

    if (error) return res.status(500).json({ error: error.message })

    const ftCount = unique.filter(j => j.source === 'france_travail').length
    const azCount = unique.filter(j => j.source === 'adzuna').length

    return res.status(200).json({ success: true, synced: unique.length, france_travail: ftCount, adzuna: azCount })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
