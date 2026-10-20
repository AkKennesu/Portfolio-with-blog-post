-- Migration: 20261019000000_harden_security_and_modernize_schema.sql
-- Description: Modernize column types, add updated_at, enforce RLS policies, and apply Least Privilege

-- 1. Ensure blog_posts has updated_at and proper DATE type
ALTER TABLE public.blog_posts 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.blog_posts 
  ALTER COLUMN date TYPE DATE USING date::date,
  ALTER COLUMN date SET NOT NULL;

-- 2. Convert certificates.year to SMALLINT and add constraints
ALTER TABLE public.certificates 
  ALTER COLUMN year TYPE SMALLINT USING year::smallint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_certificates_year'
  ) THEN
    ALTER TABLE public.certificates 
      ADD CONSTRAINT chk_certificates_year CHECK (year BETWEEN 1970 AND 2100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_certificates_title_year'
  ) THEN
    ALTER TABLE public.certificates 
      ADD CONSTRAINT uq_certificates_title_year UNIQUE (title, year);
  END IF;
END $$;

-- 3. Ensure messages columns have proper defaults and nullability
ALTER TABLE public.messages 
  ALTER COLUMN is_read SET DEFAULT false,
  ALTER COLUMN is_important SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON public.blog_posts (date DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_year_created ON public.certificates (year DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages (created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages (created_at DESC);

-- 5. Enable Row-Level Security (RLS) on ALL tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Public can view blog posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Public can view blog posts'
  ) THEN
    CREATE POLICY "Public can view blog posts" 
      ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Public can view certificates'
  ) THEN
    CREATE POLICY "Public can view certificates" 
      ON public.certificates FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public can view site settings'
  ) THEN
    CREATE POLICY "Public can view site settings" 
      ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
  END IF;

  -- Messages: ONLY INSERT allowed from public/anon. ZERO select, update, or delete!
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Public can insert contact messages'
  ) THEN
    CREATE POLICY "Public can insert contact messages" 
      ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END $$;

-- 7. Apply Principle of Least Privilege (Revoke dangerous public grants)
REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated, public;
REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON TABLE public.messages FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.blog_posts FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.certificates FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.site_settings FROM anon, authenticated, public;

GRANT SELECT ON TABLE public.blog_posts TO anon, authenticated;
GRANT SELECT ON TABLE public.certificates TO anon, authenticated;
GRANT SELECT ON TABLE public.site_settings TO anon, authenticated;
GRANT INSERT ON TABLE public.messages TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
