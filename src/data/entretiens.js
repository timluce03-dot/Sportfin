export const SECTORS = [
  {
    id: 'finance',
    label: 'Finance & Investissement',
    icon: '📊',
    desc: 'Analyse financière, valorisation, FFP, M&A sport',
    tips: [
      'Maîtrisez les règles du FFP et leur évolution vers le PSR (UEFA).',
      'Soyez capable de valoriser un club via DCF et multiples comparables.',
      'Connaissez les ratios clés : dette nette/EBITDA, masse salariale/chiffre d\'affaires.',
      'Préparez un exemple d\'opération M&A récente dans le sport.',
    ],
    questions: [
      {
        id: 1, difficulty: 'Avancé',
        q: 'Comment calculez-vous la valeur d\'un club de football ?',
        conseil: 'Présentez les 3 méthodes : DCF (projections de revenus TV, matchday, commercial), multiples EV/EBITDA des transactions comparables (8x–14x selon ligue), et actif net réévalué (valeur du roster, stade, marque). Précisez toujours le contexte (club de L1 vs Premier League).',
        pieges: 'Oublier l\'impact des droits TV sur les projections. Ne pas mentionner la spécificité sport : incertitude sportive, règles de promotion/relégation. Appliquer les mêmes multiples que pour une entreprise tech.',
      },
      {
        id: 2, difficulty: 'Intermédiaire',
        q: 'Qu\'est-ce que le Fair-Play Financier et comment impacte-t-il les décisions des clubs ?',
        conseil: 'Expliquez le principe d\'équilibre financier (pertes max autorisées sur 3 ans), les sanctions graduées (amendes, restrictions mercato, exclusion compétitions), puis évoluez vers le PSR (Profit & Sustainability Rules) de la Premier League et ses contraintes plus strictes.',
        pieges: 'Confondre FFP et règles salariales (salary cap). Ne pas mentionner les exceptions (investissements stade, académie). Ignorer que Man City a contesté les règles devant le TAS.',
      },
      {
        id: 3, difficulty: 'Débutant',
        q: 'Quelles sont les principales sources de revenus d\'un club professionnel ?',
        conseil: 'Structurez votre réponse en 4 piliers : Droits TV (souvent 40–60% pour les grands clubs européens), Matchday (billetterie, hospitalité), Commercial (sponsoring, produits dérivés, licences), et Transferts (revenus sur ventes de joueurs). Appuyez avec des chiffres récents.',
        pieges: 'Sous-estimer les droits TV comme source principale. Oublier les revenus des compétitions européennes (primes UEFA). Ne pas mentionner la diversification vers le digital et le gaming.',
      },
      {
        id: 4, difficulty: 'Avancé',
        q: 'Un fonds de Private Equity souhaite acquérir 30% d\'un club de L1 valorisé 400M€. Quels éléments de due diligence effectuez-vous ?',
        conseil: 'Structurez en 4 axes : Due diligence financière (EBITDA normalisé, dette, flux de trésorerie, provisions), Juridique (contrats joueurs, droits image, litiges, statuts du club), Opérationnelle (académie, stade, gouvernance), Sportive (valeur du roster, potentiel de développement). Mentionnez les spécificités réglementaires sport (intégrité des compétitions, multiple ownership rules).',
        pieges: 'Négliger la due diligence sportive. Oublier les règles UEFA/LFP sur la multi-propriété. Ne pas analyser la dépendance aux droits TV (risque de renégociation).',
      },
      {
        id: 5, difficulty: 'Intermédiaire',
        q: 'Comment analysez-vous la structure bilancielle d\'un club de sport professionnel ?',
        conseil: 'Insistez sur les spécificités : les joueurs apparaissent à l\'actif (immobilisations incorporelles) et s\'amortissent sur la durée du contrat. Analysez la dette nette, le ratio dette/EBITDA (seuil critique : >4x), et la structure des passifs (dettes de transferts importantes dans le foot). Calculez le free cash flow opérationnel.',
        pieges: 'Ignorer l\'impact des transferts sur la trésorerie vs le compte de résultat. Oublier les engagements hors-bilan (clauses libératoires futures). Ne pas distinguer résultat comptable et cash réel.',
      },
    ],
  },
  {
    id: 'sponsoring',
    label: 'Sponsoring & Partenariats',
    icon: '🤝',
    desc: 'Négociation, activation, ROI, naming rights',
    tips: [
      'Maîtrisez les méthodes de mesure du ROI sponsoring (équivalence publicitaire, brand lift).',
      'Préparez des exemples concrets d\'activations créatives récentes.',
      'Connaissez les tendances : naming rights, jersey sponsoring, partenariats data.',
      'Soyez capable de construire une proposition de valeur pour un sponsor.',
    ],
    questions: [
      {
        id: 1, difficulty: 'Intermédiaire',
        q: 'Comment calculez-vous le ROI d\'un partenariat de sponsoring sportif ?',
        conseil: 'Présentez les méthodes quantitatives (équivalence publicitaire médiatique, études brand awareness avant/après, mesure des ventes corrélées) et qualitatives (image de marque, hospitalité, B2B networking). Mentionnez les outils spécialisés (Nielsen Sports, Repucom) et soulignez l\'importance des KPIs définis en amont du deal.',
        pieges: 'Ne se concentrer que sur l\'exposition médiatique sans mesurer l\'engagement. Comparer des chiffres d\'équivalence publicitaire sans ajustement (visibilité vs temps de parole).',
      },
      {
        id: 2, difficulty: 'Avancé',
        q: 'Un équipementier vous demande de défendre un sponsoring jersey à 15M€/an avec un club de L1. Présentez votre pitch.',
        conseil: 'Structurez : Analyse du reach (audience TV, digital, stade), retombées presse, benchmark concurrents, exclusivité catégorielle, droits d\'image joueurs, activations prévues (retail, social media, événements). Montrez le ROAS estimé vs 15M€ investis. Incluez des clauses de sortie si objectifs non atteints.',
        pieges: 'Présenter uniquement les chiffres bruts d\'audience sans contexte. Ne pas anticiper les questions sur les clauses de relégation. Ignorer la dimension B2B (hospitalité, client entertainment).',
      },
      {
        id: 3, difficulty: 'Débutant',
        q: 'Quelle est la différence entre sponsoring title et naming rights ?',
        conseil: 'Title sponsoring = association du nom de marque à une équipe/événement (ex : Uber Eats Ligue 1). Naming rights = acquisition du nom d\'un stade/salle pour une durée définie (ex : Allianz Riviera, Accor Arena). Développez les mécaniques de prix, durées types (naming : 10-20 ans), et les risques (image risk si scandale sportif).',
        pieges: 'Confondre les deux concepts. Ne pas mentionner les tendances récentes (naming rights en Amérique du Nord beaucoup plus développés : SoFi Stadium à 5,6Md$ sur 20 ans).',
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Communication',
    icon: '📣',
    desc: 'Brand strategy, digital, fan engagement, CRM',
    tips: [
      'Comprenez les spécificités du marketing sportif : passion du fan vs consommateur classique.',
      'Maîtrisez les canaux digitaux (réseaux sociaux, OTT, NFT/Web3 tendances).',
      'Préparez un exemple de campagne d\'activation fan engagements réussie.',
      'Connaissez les outils CRM et analytics utilisés dans le sport.',
    ],
    questions: [
      {
        id: 1, difficulty: 'Intermédiaire',
        q: 'Comment un club professionnel peut-il développer sa fan base internationale ?',
        conseil: 'Structurez en 3 axes : Content strategy digitale (social media localisé, création de contenu en langues locales), Partenariats locaux (pre-season tours, clubs partenaires dans les marchés cibles), et Monétisation (streaming OTT, produits dérivés e-commerce international). Citez les succès : Real Madrid en Asie, PSG aux États-Unis.',
        pieges: 'Proposer une stratégie générique non différenciante. Ignorer les coûts de localisation. Ne pas mentionner les contraintes réglementaires locales (droits TV déjà vendus dans certains territoires).',
      },
      {
        id: 2, difficulty: 'Avancé',
        q: 'Construisez la stratégie CRM d\'un club de football de L1 disposant de 25 000 abonnés et 500 000 fans digitaux.',
        conseil: 'Définissez les segments (abonnés fidèles, fans digitaux engagés, fans occasionnels, B2B), les données collectées (comportement achat, engagement digital, géolocalisation), les actions per segment (loyalty program, communication personnalisée, offres upgrading), et les KPIs de rétention. Mentionnez les outils (Salesforce CRM, HubSpot) et la conformité RGPD.',
        pieges: 'Proposer un CRM sans segmentation claire. Ignorer le RGPD et la gestion du consentement. Ne pas chiffrer les objectifs (taux de rétention abonnés cible : >85%).',
      },
    ],
  },
  {
    id: 'medias',
    label: 'Médias & Droits TV',
    icon: '📺',
    desc: 'Droits audiovisuels, OTT, négociation, piratage',
    tips: [
      'Connaissez les montants des principaux deals de droits TV en Europe et dans le monde.',
      'Comprenez les modèles OTT et leur impact sur la télévision traditionnelle.',
      'Soyez capable d\'expliquer les mécanismes de répartition des droits au sein d\'une ligue.',
      'Préparez votre position sur la crise des droits en Ligue 1 (DAZN).',
    ],
    questions: [
      {
        id: 1, difficulty: 'Avancé',
        q: 'Analysez la crise des droits TV de la Ligue 1 et proposez des solutions pour 2025-2029.',
        conseil: 'Analysez les causes : surévaluation des droits (1,15Md€ avec DAZN), paiements non honorés, perte de compétitivité vs Premier League. Solutions : package mixte (canal payant + canal gratuit accessible), appel d\'offres plus fragmenté (par package), développement OTT propriétaire, partenariats avec télécoms. Positionnez vs la Premier League (6,7Md€/saison).',
        pieges: 'Ignorer la dimension internationale des droits (souvent 20-30% du total). Proposer des solutions sans chiffrer l\'impact. Ne pas mentionner le rôle des ligues étrangères qui captent des parts de marché.',
      },
      {
        id: 2, difficulty: 'Intermédiaire',
        q: 'Qu\'est-ce qu\'un deal de droits "bundlé" et pourquoi les ligues l\'utilisent-elles ?',
        conseil: 'Un deal bundlé = vente groupée de plusieurs droits (live, rediffusion, highlights, digital, international) à un même diffuseur. Avantages pour la ligue : simplification, meilleure valorisation globale, interlocuteur unique. Inconvénients : risque de dépendance (si diffuseur fait défaut : cf. DAZN), moins de concurrence entre diffuseurs. Tendance actuelle : vers une fragmentation pour maximiser la compétition.',
        pieges: 'Confondre droits live et droits highlights (monétisation très différente). Ignorer les droits numériques qui deviennent de plus en plus valorisés.',
      },
    ],
  },
  {
    id: 'strategie',
    label: 'Stratégie & Conseil',
    icon: '♟️',
    desc: 'Business development, conseil, gouvernance, restructuration',
    tips: [
      'Structurez vos réponses avec des frameworks : SWOT, Porter, McKinsey 7S.',
      'Préparez des études de cas de repositionnement ou diversification de structures sport.',
      'Montrez votre capacité à passer du diagnostic à la recommandation chiffrée.',
      'Connaissez les grands enjeux de gouvernance du sport (corruption, intégrité, diversité).',
    ],
    questions: [
      {
        id: 1, difficulty: 'Avancé',
        q: 'La Fédération Française de Football vous mandate pour définir la stratégie de développement du football féminin sur 5 ans. Par où commencez-vous ?',
        conseil: 'Phase 1 Diagnostic : analyse de l\'existant (nombre de licenciées, audience D1 Arkema, revenus actuels, benchmark international NWSL/WSL). Phase 2 Enjeux : identifier les freins (médiatisation insuffisante, disparité de revenus, manque de stades dédiés). Phase 3 Recommandations chiffrées : droits TV objectif, nombre de licenciées cible, plan d\'investissement, KPIs. Montrez une feuille de route sur 5 ans.',
        pieges: 'Partir directement en recommandations sans phase de diagnostic. Ignorer la dimension financière (qui finance ? Quel modèle économique ?). Ne pas aborder les résistances organisationnelles.',
      },
    ],
  },
  {
    id: 'data',
    label: 'Data & Analytics',
    icon: '🔬',
    desc: 'Performance analytics, scouting data, business intelligence',
    tips: [
      'Maîtrisez les principales métriques de performance (Expected Goals, PPDA, etc.).',
      'Connaissez les outils du secteur : Wyscout, StatsBomb, Opta, Catapult.',
      'Soyez capable d\'expliquer comment la data transforme le recrutement et la tactique.',
      'Préparez un exemple où la data analytics a créé une valeur business concrète.',
    ],
    questions: [
      {
        id: 1, difficulty: 'Intermédiaire',
        q: 'Comment la data analytics transforme-t-elle le recrutement dans le football professionnel ?',
        conseil: 'Expliquez la chaîne de valeur data : collecte (GPS, video tracking), modélisation (expected metrics, scores de performance), identification (shortlists algorithmiques, comparaison de profils), validation humaine (scouts, entraîneur). Citez des exemples : Liverpool/Ian Graham (Moneyball du foot), le Brentford FC comme club data-driven. Mentionnez les limites : fit culturel, blessures, facteurs psychologiques.',
        pieges: 'Présenter la data comme suffisante sans la dimension humaine. Confondre données GPS (physiques) et données tactiques (positionnelles). Ignorer les contraintes réglementaires sur la collecte de données joueurs.',
      },
      {
        id: 2, difficulty: 'Avancé',
        q: 'Un club de L2 vous demande de construire un tableau de bord BI pour le directeur sportif. Que proposez-vous ?',
        conseil: 'Définissez les 3 niveaux : Performance sportive (xG, progression joueurs, charge physique), Mercato (shortlists avec scores, valeur marché, comparables), Business (coût/performance joueur, projection budgétaire transferts). Outils recommandés : Power BI ou Tableau, intégré à Wyscout/Opta. Insistez sur l\'accessibilité (dashboard visuel, pas uniquement des tableurs) et la fréquence de mise à jour.',
        pieges: 'Proposer un outil trop complexe non adapté aux ressources d\'un club de L2. Ignorer la gouvernance des données (qui a accès à quoi). Ne pas anticiper la formation des utilisateurs.',
      },
    ],
  },
]
