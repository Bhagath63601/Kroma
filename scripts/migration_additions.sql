-- Migration additions: Contact submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Allow public insert on contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Allow admin read on contact_submissions" ON public.contact_submissions;

-- Create policies
CREATE POLICY "Allow public insert on contact_submissions" ON public.contact_submissions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow admin read on contact_submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_admin());
