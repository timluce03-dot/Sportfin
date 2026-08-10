-- 003_design_settings.sql
-- Single-row table storing the full platform theme as JSONB.
-- Clients load this on mount and subscribe via Supabase Realtime so that
-- any change in /admin/design propagates to all open sessions in real time.

CREATE TABLE IF NOT EXISTS public.design_settings (
  id         int          PRIMARY KEY DEFAULT 1,
  theme      jsonb        NOT NULL DEFAULT '{}',
  updated_at timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.design_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_design"  ON public.design_settings;
DROP POLICY IF EXISTS "admin_write_design"  ON public.design_settings;

-- Everyone can read (needed for the public site)
CREATE POLICY "public_read_design" ON public.design_settings
  FOR SELECT USING (true);

-- Only admin role can write
CREATE POLICY "admin_write_design" ON public.design_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed the single row so SELECT .single() never 404s
INSERT INTO public.design_settings (id, theme)
  VALUES (1, '{}')
  ON CONFLICT (id) DO NOTHING;

-- Broadcast changes via Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.design_settings;
