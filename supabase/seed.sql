-- ============================================================
-- SportFin — Seed data
-- À exécuter après 001_schema.sql
-- Idempotent : utilise ON CONFLICT DO NOTHING
-- ============================================================

-- UUIDs déterministes pour les entités de seed
-- Course principal : c0000001-0000-0000-0000-000000000000
-- Quizzes          : d0000001..d000000c-0000-0000-0000-000000000000

-- ── Course principal ───────────────────────────────────────
INSERT INTO public.courses (id, title, description, level, duration, is_premium, published)
VALUES (
  'c0000001-0000-0000-0000-000000000000',
  'Finance & Sport Business',
  'La formation de référence pour maîtriser les enjeux financiers, stratégiques et réglementaires du sport professionnel.',
  'Tous niveaux',
  '30h+',
  false,
  true
)
ON CONFLICT (id) DO NOTHING;

-- ── Chapitres (Partie 1) ───────────────────────────────────
INSERT INTO public.chapters (course_id, part_num, part_title, title, duration, is_premium, position, type)
VALUES
  ('c0000001-0000-0000-0000-000000000000', 1, 'Fondamentaux comptables et financiers appliqués au sport', 'Introduction à la comptabilité financière dans un club sportif', '18 min', false, 1, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 1, 'Fondamentaux comptables et financiers appliqués au sport', 'Lecture et analyse des états financiers d''un club', '24 min', false, 2, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 1, 'Fondamentaux comptables et financiers appliqués au sport', 'Les sources de revenus et dépenses d''une structure professionnelle', '20 min', false, 3, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 1, 'Fondamentaux comptables et financiers appliqués au sport', 'Budgétisation et prévisions financières dans un club', '22 min', true, 4, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 1, 'Fondamentaux comptables et financiers appliqués au sport', 'Amortissement des contrats de joueurs et actifs immatériels', '19 min', true, 5, 'lecture')
ON CONFLICT DO NOTHING;

-- ── Chapitres (Partie 2) ───────────────────────────────────
INSERT INTO public.chapters (course_id, part_num, part_title, title, duration, is_premium, position, type)
VALUES
  ('c0000001-0000-0000-0000-000000000000', 2, 'Gestion financière opérationnelle d''un club', 'Gestion de trésorerie et liquidité', '21 min', true, 6, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 2, 'Gestion financière opérationnelle d''un club', 'Pilotage budgétaire et contrôle de gestion', '23 min', true, 7, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 2, 'Gestion financière opérationnelle d''un club', 'Masse salariale et soutenabilité financière', '26 min', true, 8, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 2, 'Gestion financière opérationnelle d''un club', 'Analyse des transferts entrants et sortants', '20 min', true, 9, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 2, 'Gestion financière opérationnelle d''un club', 'Reporting financier et communication aux actionnaires', '18 min', true, 10, 'lecture')
ON CONFLICT DO NOTHING;

-- ── Chapitres (Partie 3) ───────────────────────────────────
INSERT INTO public.chapters (course_id, part_num, part_title, title, duration, is_premium, position, type)
VALUES
  ('c0000001-0000-0000-0000-000000000000', 3, 'Business, stratégie et valorisation', 'Valorisation des clubs sportifs — méthodes et multiples', '28 min', true, 11, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 3, 'Business, stratégie et valorisation', 'Droits TV et économie audiovisuelle', '30 min', true, 12, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 3, 'Business, stratégie et valorisation', 'Sponsoring, naming et activation de partenariats', '24 min', true, 13, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 3, 'Business, stratégie et valorisation', 'M&A dans le sport : acquisitions et multipropriété', '25 min', true, 14, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 3, 'Business, stratégie et valorisation', 'Stratégie de croissance internationale', '22 min', true, 15, 'lecture')
ON CONFLICT DO NOTHING;

-- ── Chapitres (Partie 4) ───────────────────────────────────
INSERT INTO public.chapters (course_id, part_num, part_title, title, duration, is_premium, position, type)
VALUES
  ('c0000001-0000-0000-0000-000000000000', 4, 'Cadre juridique et réglementaire', 'Fair-play financier UEFA — règles et sanctions', '22 min', true, 16, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 4, 'Cadre juridique et réglementaire', 'DNCG et contrôle financier des clubs français', '20 min', true, 17, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 4, 'Cadre juridique et réglementaire', 'Contrats sportifs : agents, joueurs, entraîneurs', '21 min', true, 18, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 4, 'Cadre juridique et réglementaire', 'Régulation internationale du football', '19 min', true, 19, 'lecture'),
  ('c0000001-0000-0000-0000-000000000000', 4, 'Cadre juridique et réglementaire', 'Gouvernance des clubs et protection des actionnaires', '18 min', true, 20, 'lecture')
ON CONFLICT DO NOTHING;

-- ── Exercices ──────────────────────────────────────────────
INSERT INTO public.exercises (course_id, title, description, category, difficulty, position, published)
VALUES
  ('c0000001-0000-0000-0000-000000000000', 'Analyser les comptes d''un club Ligue 1', 'Interprétez les états financiers du FC Lumière pour identifier risques et leviers de croissance.', 'Finance', 'Intermédiaire', 1, true),
  ('c0000001-0000-0000-0000-000000000000', 'Calculer la part des droits TV dans les revenus', 'Étude comparative : structure de revenus Ligue 1 vs Premier League sur 5 saisons.', 'Droits TV', 'Débutant', 2, true),
  ('c0000001-0000-0000-0000-000000000000', 'Construire un budget prévisionnel de saison', 'À partir d''hypothèses réalistes, construisez le budget complet d''un club de L2.', 'Budgétisation', 'Intermédiaire', 3, true),
  ('c0000001-0000-0000-0000-000000000000', 'Amortir un contrat joueur sur 4 ans', 'Calcul des amortissements et impact sur le résultat comptable d''un transfert à 12M€.', 'Comptabilité', 'Intermédiaire', 4, true),
  ('c0000001-0000-0000-0000-000000000000', 'Comparer sponsoring maillot et naming', 'Analysez les mécanismes de valorisation de ces deux vecteurs de revenus commerciaux.', 'Sponsoring', 'Débutant', 5, true),
  ('c0000001-0000-0000-0000-000000000000', 'Calculer l''EBITDA ajusté d''un club professionnel', 'Application des retraitements EBITDA spécifiques au contexte sport et comparaison sectorielle.', 'Finance', 'Avancé', 6, true),
  ('c0000001-0000-0000-0000-000000000000', 'Valoriser un club de Ligue 2 par la méthode des multiples', 'Utilisation des multiples de transaction récents pour établir une fourchette de valorisation.', 'Valorisation', 'Avancé', 7, true),
  ('c0000001-0000-0000-0000-000000000000', 'Simuler l''impact d''une relégation sur les droits TV', 'Modélisation de la chute de revenus et des mesures d''ajustement à prévoir pour un club.', 'Droits TV', 'Avancé', 8, true),
  ('c0000001-0000-0000-0000-000000000000', 'Étudier un cas de fair-play financier UEFA', 'Analyse d''un club sous monitoring UEFA et simulation des mesures correctrices possibles.', 'Réglementation', 'Avancé', 9, true),
  ('c0000001-0000-0000-0000-000000000000', 'Construire un plan de financement de stade', 'Montage financier mixte dette/fonds propres pour un stade à 200M€, avec business plan.', 'Investissement', 'Expert', 10, true)
ON CONFLICT DO NOTHING;

-- ── Quiz ───────────────────────────────────────────────────
INSERT INTO public.quizzes (id, title, description, category, icon, theme, difficulty, question_count, published)
VALUES
  ('d0000001-0000-0000-0000-000000000000', 'Droits TV & Médias', 'Questions sur l''économie audiovisuelle du sport.', 'Droits TV', '📺', 'Droits TV', 'Intermédiaire', 20, true),
  ('d0000002-0000-0000-0000-000000000000', 'Finance des clubs', 'Bilan, résultats, FPF, DNCG : les fondamentaux comptables.', 'Finance', '💶', 'Finance', 'Débutant', 20, true),
  ('d0000003-0000-0000-0000-000000000000', 'Sponsoring & Partenariats', 'Activation, ROI, naming : les enjeux commerciaux du sport.', 'Sponsoring', '🤝', 'Sponsoring', 'Débutant', 20, true),
  ('d0000004-0000-0000-0000-000000000000', 'Private Equity & M&A', 'LBO, valorisation de clubs, multipropriété et deal flow.', 'Finance', '📈', 'Finance', 'Avancé', 20, true),
  ('d0000005-0000-0000-0000-000000000000', 'Gouvernance du sport', 'FIFA, UEFA, CIO, DNCG, FPF — structures et régulations.', 'Gouvernance', '⚖️', 'Gouvernance', 'Intermédiaire', 20, true),
  ('d0000006-0000-0000-0000-000000000000', 'Droit du sport', 'Contrats de joueurs, agents, transferts : le cadre juridique.', 'Droit', '📋', 'Droit', 'Avancé', 20, true),
  ('d0000007-0000-0000-0000-000000000000', 'Data & Analytics', 'Scouting, Expected Goals, analyse de performance.', 'Data', '📊', 'Data', 'Intermédiaire', 20, true),
  ('d0000008-0000-0000-0000-000000000000', 'Marketing Sportif', 'Fan engagement, CRM, brand building dans le sport.', 'Marketing', '📣', 'Marketing', 'Débutant', 20, true),
  ('d0000009-0000-0000-0000-000000000000', 'Billetterie & Stades', 'Revenue management, hospitalités, nouvelles enceintes.', 'Événementiel', '🏟️', 'Événementiel', 'Intermédiaire', 20, true),
  ('d000000a-0000-0000-0000-000000000000', 'Sport Féminin & Égalité', 'Valorisation, médiatisation et économie du sport féminin.', 'Stratégie', '⚽', 'Stratégie', 'Débutant', 20, true),
  ('d000000b-0000-0000-0000-000000000000', 'Mercato & Transferts', 'Structure, financement et impact financier des transferts.', 'Finance', '🔄', 'Finance', 'Intermédiaire', 20, true),
  ('d000000c-0000-0000-0000-000000000000', 'Sport & Numérique', 'OTT, NFT, Metaverse sport, e-sport et innovation digitale.', 'Digital', '💻', 'Digital', 'Avancé', 20, true)
ON CONFLICT (id) DO NOTHING;

-- ── Questions (Quiz Droits TV — 5 exemples) ────────────────
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_index, explanation, position)
VALUES
  ('d0000001-0000-0000-0000-000000000000',
   'Quel est le terme désignant le droit de retransmission audiovisuelle d''une compétition sportive ?',
   '["Droit d''auteur sportif","Droit TV","Licence de diffusion","Droit d''exploitation"]'::jsonb,
   1, 'Les droits TV (ou droits audiovisuels) permettent à un diffuseur de retransmettre une compétition sportive sur un territoire donné et pour une durée définie.', 1),
  ('d0000001-0000-0000-0000-000000000000',
   'Quelle organisation française contrôle la santé financière des clubs professionnels de football ?',
   '["FFF","LFP","DNCG","FIFA"]'::jsonb,
   2, 'La Direction Nationale du Contrôle de Gestion (DNCG) est l''organe de contrôle financier des clubs professionnels de football en France.', 2),
  ('d0000001-0000-0000-0000-000000000000',
   'Qu''est-ce que le Fair-Play Financier UEFA ?',
   '["Un règlement interdisant les investissements dans les clubs","Un système limitant les dépenses aux revenus générés","Une taxe sur les transferts internationaux","Un programme de formation financière pour les clubs"]'::jsonb,
   1, 'Le Fair-Play Financier (FPF) vise à ce que les clubs ne dépensent pas plus qu''ils ne gagnent, assurant la durabilité financière du football européen.', 3),
  ('d0000001-0000-0000-0000-000000000000',
   'Comment s''appelle la méthode de valorisation basée sur les flux de trésorerie futurs ?',
   '["EV/EBITDA","Price/Earnings","DCF (Discounted Cash Flows)","NAV (Net Asset Value)"]'::jsonb,
   2, 'La méthode DCF actualise les flux de trésorerie futurs attendus au taux de coût du capital pour obtenir la valeur d''une entreprise.', 4),
  ('d0000001-0000-0000-0000-000000000000',
   'Quelle est la principale source de revenus d''un club de Ligue 1 en moyenne ?',
   '["Billetterie","Merchandising","Droits TV","Sponsoring maillot"]'::jsonb,
   2, 'Les droits TV représentent généralement la part la plus importante des revenus d''un club de Ligue 1 (entre 30 et 50% selon les clubs).', 5)
ON CONFLICT DO NOTHING;

-- ── Offres Career Center ───────────────────────────────────
INSERT INTO public.jobs (title, company, location, contract, domain, duration, description, img, published)
VALUES
  ('Analyste Financier Sport Business', 'Olympique Lyonnais', 'Lyon', 'CDI', 'Finance', '>6', 'Analyse des performances financières du club, modélisation des transferts et reporting DNCG.', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80', true),
  ('Stagiaire Contrôleur de Gestion', 'LFP', 'Paris', 'Stage', 'Finance', '4-6', 'Suivi budgétaire et analyse des flux de droits TV au sein de la Ligue de Football Professionnel.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80', true),
  ('Marketing Manager Partenariats', 'Adidas France', 'Paris', 'CDI', 'Marketing', '>6', 'Pilotage de la stratégie marketing des partenariats sportifs, activation terrain et suivi KPIs.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', true),
  ('Chargé de Partenariats Sportifs', 'ASO', 'Paris', 'CDD', 'Sponsoring', '4-6', 'Gestion des partenaires premium du Tour de France et coordination des hospitalities B2B.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80', true),
  ('Data Analyst Performance Commerciale', 'PSG', 'Paris', 'CDI', 'Data', '>6', 'Analyse CRM, billetterie et merchandising pour optimiser la stratégie commerciale du club.', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80', true),
  ('Stagiaire Analyste Droits TV', 'Canal+', 'Paris', 'Stage', 'Médias', '4-6', 'Veille des marchés audiovisuels, analyse concurrentielle et support aux négociations droits.', 'https://images.unsplash.com/photo-1498075702571-ecb018f3752d?auto=format&fit=crop&w=400&q=80', true),
  ('Responsable Hospitalités B2B', 'ASSE', 'Saint-Étienne', 'CDI', 'Événementiel', '>6', 'Commercialisation des loges et espaces VIP du Stade Geoffroy-Guichard, animation matchday.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', true),
  ('Business Analyst Billetterie', 'Stade de France', 'Saint-Denis', 'CDI', 'Finance', '>6', 'Revenue management billetterie, analyse des ventes et optimisation parcours d''achat digital.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80', true),
  ('Junior Investment Analyst Sport', 'Sportfive', 'Paris', 'CDI', 'Finance', '>6', 'Modélisation financière des transactions M&A, due diligence et pitchs clients dans le sport.', 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=400&q=80', true),
  ('Chargé Développement Commercial', 'FFT / Roland-Garros', 'Paris', 'CDI', 'Sponsoring', '>6', 'Développement du portefeuille partenaires de la Fédération Française de Tennis.', 'https://images.unsplash.com/photo-1504670073073-6123e39f35b1?auto=format&fit=crop&w=400&q=80', true),
  ('Chargé de Mission RSE Sport', 'FFF', 'Paris', 'CDD', 'Stratégie', '4-6', 'Développement et pilotage des programmes RSE de la Fédération Française de Football.', 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=400&q=80', true),
  ('Analyste Droits TV', 'beIN Sports', 'Paris', 'CDI', 'Médias', '>6', 'Analyse des marchés de droits audiovisuels sportifs et support aux stratégies d''acquisition.', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80', true),
  ('Contrôleur de Gestion Sport', 'Stade Français Paris', 'Paris', 'CDI', 'Finance', '>6', 'Pilotage du contrôle de gestion du club et reporting financier aux actionnaires.', 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=400&q=80', true),
  ('Assistant Partenariats Sportifs', 'L''Équipe', 'Paris', 'Stage', 'Sponsoring', '4-6', 'Suivi des partenariats éditoriaux et événementiels, support aux équipes commerciales.', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80', true),
  ('Chef de Projet Événementiel', 'ASO', 'Paris', 'CDI', 'Événementiel', '>6', 'Coordination opérationnelle des grands événements cyclistes (Tour de France, Paris-Roubaix).', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80', true),
  ('Chargé CRM & Fan Engagement', 'OGC Nice', 'Nice', 'CDI', 'Marketing', '>6', 'Stratégie CRM, segmentation des campagnes et programmes de fidélité abonnés.', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80', true),
  ('Consultant Stratégie Sport', 'Sportfive', 'Paris', 'CDI', 'Conseil', '>6', 'Missions de conseil en stratégie pour clubs, ligues et investisseurs du secteur sportif.', 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?auto=format&fit=crop&w=400&q=80', true),
  ('Stage Développement International', 'AJ Auxerre', 'Auxerre', 'Stage', 'Stratégie', '4-6', 'Stratégie de développement international du club, notamment en Afrique et en Asie.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80', true),
  ('Stage Stagiaire Merchandising', 'Nike', 'Paris', 'Stage', 'Marketing', '4-6', 'Stratégie merchandising des gammes football et running, analyse des ventes par catégorie.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80', true),
  ('Responsable FP&A', 'Paris Saint-Germain', 'Paris', 'CDI', 'Finance', '>6', 'Financial Planning & Analysis, modélisation budgétaire et pilotage de la performance financière.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', true),
  ('Analyste Data Sport', 'FIFA', 'Zurich', 'CDI', 'Data', '>6', 'Analyse des données performance, scouting analytique et modèles prédictifs de transferts.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', true)
ON CONFLICT DO NOTHING;

-- ── Podcasts ───────────────────────────────────────────────
INSERT INTO public.podcasts (title, guest, duration, category, description, thumbnail, youtube_id, published, published_at)
VALUES
  ('La crise des droits TV en Ligue 1 : causes, conséquences et solutions', 'Pierre-Antoine Capton — Président, Mediapro (ancien)', '58 min', 'Droits TV', 'Retour sur l''épisode DAZN, l''impact sur les finances des clubs de L1 et les scénarios pour l''appel d''offres 2025-2029.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', null, true, '2025-02-10'),
  ('Private Equity & Sport : comment les fonds valorisent-ils les clubs ?', 'Sophie Lambard — Partner, CVC Capital Partners', '45 min', 'Finance', 'CVC, Silver Lake, RedBird... Les fonds d''investissement ont changé la donne dans le sport mondial. Sophie Lambard nous explique les mécanismes de valorisation.', 'https://images.unsplash.com/photo-1540747913346-19212a4bbed5?auto=format&fit=crop&w=800&q=80', null, true, '2025-01-28'),
  ('Le sponsoring sport en 2025 : nouvelles règles, nouveaux acteurs', 'Marc Duval — Head of Partnerships, Paris Saint-Germain', '42 min', 'Sponsoring', 'Crypto, IA, sustainability... Comment le marché du sponsoring sportif se réinvente ? Marc Duval partage les coulisses des grands deals du PSG.', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80', null, true, '2025-01-15'),
  ('Football féminin : modèle économique viable ou dépendance structurelle ?', 'Amélie Gerbaud — DG, Olympique Lyonnais Féminin', '51 min', 'Finance', 'L''OL féminin est la meilleure équipe au monde. Mais quel est le modèle économique derrière ce succès ? Rentabilité, droits TV, partenariats.', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80', null, true, '2024-12-20'),
  ('Data Analytics : comment Liverpool a révolutionné le recrutement', 'Dr. Ian Graham — Ex-Head of Research, Liverpool FC', '63 min', 'Data', 'Le "Moneyball du football" : comment les algorithmes de Liverpool ont identifié Salah, Van Dijk et Mané avant tout le monde.', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', null, true, '2024-12-05'),
  ('Career : passer du terrain au bureau — témoignages de reconvertis', 'Collectif — 4 anciens athlètes reconvertis en sport business', '38 min', 'Career', 'Quatre anciens sportifs professionnels racontent leur reconversion en sport business : les clés du succès, les erreurs à éviter, les réseaux à activer.', 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80', null, true, '2024-11-18')
ON CONFLICT DO NOTHING;

-- ── Articles ───────────────────────────────────────────────
INSERT INTO public.articles (title, excerpt, category, cover_url, published, published_at, author)
VALUES
  ('Pourquoi les droits TV restent le moteur financier du sport moderne', 'De la Ligue 1 à la NFL, comment les droits audiovisuels structurent les budgets et la compétitivité des clubs.', 'Droits TV', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=600&q=80', true, '2026-06-12', 'Équipe SportFin'),
  ('Comment les fonds d''investissement transforment le football européen', 'Private equity, multipropriété, valorisation : la finance prend le pouvoir dans les clubs.', 'Investissement', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80', true, '2026-06-10', 'Équipe SportFin'),
  ('La multipropriété transforme-t-elle le football ?', 'City Football Group, RedBird, BlueCo : quand un investisseur possède plusieurs clubs à la fois.', 'Stratégie', 'https://images.unsplash.com/photo-1529928520614-7b9e8e8a1ce9?auto=format&fit=crop&w=600&q=80', true, '2026-06-08', 'Équipe SportFin'),
  ('Pourquoi certains clubs historiques frôlent la liquidation judiciaire', 'Girondins, Valenciennes, Southend : les mécanismes financiers qui mènent un club à la faillite.', 'Finance', 'https://images.unsplash.com/photo-1570126618953-d437176e8c79?auto=format&fit=crop&w=600&q=80', true, '2026-06-05', 'Équipe SportFin'),
  ('Le sponsoring sportif est-il encore rentable pour les marques ?', 'ROI, activation, data : comment les marques mesurent vraiment leur investissement dans le sport.', 'Sponsoring', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80', true, '2026-06-03', 'Équipe SportFin'),
  ('La data transforme le recrutement dans les clubs', 'Scouting algorithmique, modèles prédictifs et Expected Value : la révolution analytique du football.', 'Data', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', true, '2026-05-27', 'Équipe SportFin'),
  ('Le sport féminin entre dans une nouvelle phase économique', 'Droits TV, sponsoring, audiences : la valorisation du sport féminin s''accélère partout en Europe.', 'Sport féminin', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80', true, '2026-05-29', 'Équipe SportFin'),
  ('La billetterie premium devient-elle un levier stratégique ?', 'Loges VIP, hospitalités B2B, abonnements dynamiques : la révolution de l''expérience stade.', 'Billetterie', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80', true, '2026-06-01', 'Équipe SportFin'),
  ('Pourquoi le sport business a besoin de profils financiers', 'DAF, contrôleur de gestion, analyste : les métiers financiers sont devenus essentiels dans le sport professionnel.', 'Carrières', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80', true, '2026-05-23', 'Équipe SportFin')
ON CONFLICT DO NOTHING;
