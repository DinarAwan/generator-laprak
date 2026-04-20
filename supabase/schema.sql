-- ============================================
-- Auto-Laprak UAD — Supabase SQL Schema
-- ============================================

-- Tabel users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nama_lengkap TEXT NOT NULL DEFAULT '',
  nim TEXT NOT NULL DEFAULT '',
  status_langganan TEXT NOT NULL DEFAULT 'free'
    CHECK (status_langganan IN ('free', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa SELECT row miliknya sendiri
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Policy: user bisa UPDATE row miliknya sendiri
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: service role bisa INSERT (untuk auto-create on signup)
CREATE POLICY "Service role can insert"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function: auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nama_lengkap, nim)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (regexp_match(NEW.email, '^(\d+)'))[1],
      ''
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fire on new auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
