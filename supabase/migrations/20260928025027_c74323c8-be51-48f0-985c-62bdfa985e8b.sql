ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_accent_check;
ALTER TABLE public.subjects ADD CONSTRAINT subjects_accent_check CHECK (accent IN ('halo','gold','none'));