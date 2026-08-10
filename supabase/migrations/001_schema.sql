-- ============================================================
-- SportFin — Migration 001
-- À exécuter une seule fois dans l'éditeur SQL de Supabase
-- ============================================================

-- ── Colonnes supplémentaires sur chapters ──────────────────
ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS part_num   integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS part_title text;

-- ── Colonnes supplémentaires sur quizzes ──────────────────
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS icon  text NOT NULL DEFAULT '🧠',
  ADD COLUMN IF NOT EXISTS theme text;

-- ============================================================
-- exercises
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid        REFERENCES public.courses(id) ON DELETE SET NULL,
  title       text        NOT NULL,
  description text,
  category    text,
  difficulty  text        NOT NULL DEFAULT 'Intermédiaire',
  position    integer     NOT NULL DEFAULT 0,
  content     text,
  published   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_exercises" ON public.exercises;
CREATE POLICY "public_read_exercises"
  ON public.exercises FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "auth_manage_exercises" ON public.exercises;
CREATE POLICY "auth_manage_exercises"
  ON public.exercises FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  company     text        NOT NULL,
  location    text,
  contract    text        NOT NULL DEFAULT 'CDI',
  domain      text,
  duration    text,
  description text,
  img         text,
  apply_url   text,
  published   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_jobs" ON public.jobs;
CREATE POLICY "public_read_jobs"
  ON public.jobs FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "auth_manage_jobs" ON public.jobs;
CREATE POLICY "auth_manage_jobs"
  ON public.jobs FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- podcasts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.podcasts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  guest        text,
  duration     text,
  category     text,
  description  text,
  thumbnail    text,
  youtube_id   text,
  published    boolean     NOT NULL DEFAULT true,
  published_at date,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_podcasts" ON public.podcasts;
CREATE POLICY "public_read_podcasts"
  ON public.podcasts FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "auth_manage_podcasts" ON public.podcasts;
CREATE POLICY "auth_manage_podcasts"
  ON public.podcasts FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- (Priorité 2 — tables créées, admin à venir)
-- reviews, features, pricing_plans, certification_levels,
-- certification_brands, interview_questions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  role       text,
  content    text        NOT NULL,
  score      integer     NOT NULL DEFAULT 5,
  published  boolean     NOT NULL DEFAULT true,
  position   integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON public.reviews;
CREATE POLICY "public_read_reviews" ON public.reviews FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "auth_manage_reviews" ON public.reviews;
CREATE POLICY "auth_manage_reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
