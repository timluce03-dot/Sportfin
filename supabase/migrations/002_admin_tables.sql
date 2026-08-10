-- ═══════════════════════════════════════════════════════════════
-- 002_admin_tables.sql — Avis · Tarifs · Certification · Settings
-- ═══════════════════════════════════════════════════════════════

-- ── Reviews (Avis utilisateurs) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  role        text,
  company     text,
  avatar      text,
  rating      integer     DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  content     text        NOT NULL,
  position    integer     DEFAULT 0,
  published   boolean     DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read reviews"  ON public.reviews;
DROP POLICY IF EXISTS "admin write reviews"  ON public.reviews;
CREATE POLICY "public read reviews"  ON public.reviews FOR SELECT USING (published = true);
CREATE POLICY "admin write reviews"  ON public.reviews FOR ALL   USING (auth.role() = 'authenticated');

-- ── Plans (Tarifs) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plans (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  price       text,
  period      text,
  subtitle    text,
  features    jsonb       DEFAULT '[]',
  highlighted boolean     DEFAULT false,
  cta_label   text        DEFAULT 'Commencer',
  position    integer     DEFAULT 0,
  published   boolean     DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read plans"  ON public.plans;
DROP POLICY IF EXISTS "admin write plans"  ON public.plans;
CREATE POLICY "public read plans"  ON public.plans FOR SELECT USING (published = true);
CREATE POLICY "admin write plans"  ON public.plans FOR ALL   USING (auth.role() = 'authenticated');

-- ── Settings (key-value store) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  key         text        PRIMARY KEY,
  value       text        DEFAULT '',
  label       text,
  description text,
  category    text        DEFAULT 'general',
  type        text        DEFAULT 'text'
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read settings"  ON public.settings;
DROP POLICY IF EXISTS "admin write settings"  ON public.settings;
CREATE POLICY "public read settings"  ON public.settings FOR SELECT TO anon USING (true);
CREATE POLICY "admin write settings"  ON public.settings FOR ALL   USING (auth.role() = 'authenticated');

-- ── Certification levels ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certification_levels (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  badge       text        DEFAULT '🏅',
  tagline     text,
  description text,
  price       text,
  duration    text,
  position    integer     DEFAULT 0,
  published   boolean     DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.certification_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read cert_levels"  ON public.certification_levels;
DROP POLICY IF EXISTS "admin write cert_levels"  ON public.certification_levels;
CREATE POLICY "public read cert_levels"  ON public.certification_levels FOR SELECT USING (published = true);
CREATE POLICY "admin write cert_levels"  ON public.certification_levels FOR ALL   USING (auth.role() = 'authenticated');

-- ── Certification brands ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certification_brands (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  logo_url    text,
  description text,
  position    integer     DEFAULT 0,
  published   boolean     DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.certification_brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read cert_brands"  ON public.certification_brands;
DROP POLICY IF EXISTS "admin write cert_brands"  ON public.certification_brands;
CREATE POLICY "public read cert_brands"  ON public.certification_brands FOR SELECT USING (published = true);
CREATE POLICY "admin write cert_brands"  ON public.certification_brands FOR ALL   USING (auth.role() = 'authenticated');

-- ── Default settings seed ─────────────────────────────────────
INSERT INTO public.settings (key, value, label, description, category, type) VALUES
  ('site_name',           'SportFin',                          'Nom du site',           '',  'general',      'text'),
  ('site_tagline',        'La référence du sport business',    'Tagline',               '',  'general',      'text'),
  ('contact_email',       'contact@sportfin.fr',               'Email de contact',      '',  'general',      'text'),
  ('support_email',       'support@sportfin.fr',               'Email support',         '',  'general',      'text'),
  ('social_linkedin',     '',                                  'LinkedIn URL',          '',  'social',       'text'),
  ('social_twitter',      '',                                  'Twitter / X URL',       '',  'social',       'text'),
  ('social_instagram',    '',                                  'Instagram URL',         '',  'social',       'text'),
  ('social_youtube',      '',                                  'YouTube URL',           '',  'social',       'text'),
  ('stat_apprenants',     '4 500+',                            'Stat — Apprenants',     '',  'home',         'text'),
  ('stat_satisfaction',   '98%',                               'Stat — Satisfaction',   '',  'home',         'text'),
  ('stat_modules',        '4',                                 'Stat — Modules',        '',  'home',         'text'),
  ('stat_certifies',      '3 000+',                            'Stat — Certifiés',      '',  'home',         'text'),
  ('announcement_active', 'false',                             'Bannière active',       '',  'announcement', 'boolean'),
  ('announcement_text',   '',                                  'Texte de la bannière',  '',  'announcement', 'text'),
  ('announcement_color',  '#C9A84C',                           'Couleur de la bannière','',  'announcement', 'color')
ON CONFLICT (key) DO NOTHING;
