ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1;
DROP TABLE IF EXISTS public.notes;

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.units TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT ALL ON public.units TO service_role;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads units" ON public.units FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write units" ON public.units FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.unit_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'video',
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.unit_resources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.unit_resources TO authenticated;
GRANT ALL ON public.unit_resources TO service_role;
ALTER TABLE public.unit_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads resources" ON public.unit_resources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write resources" ON public.unit_resources FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX ON public.units(subject_id);
CREATE INDEX ON public.unit_resources(unit_id);