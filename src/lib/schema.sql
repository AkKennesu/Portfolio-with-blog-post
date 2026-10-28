-- ====================================================================
-- Schema Definition conforming to Supabase & Postgres Best Practices
-- ====================================================================

-- 1. Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    year SMALLINT NOT NULL CHECK (year BETWEEN 1970 AND 2100),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_certificates_title_year UNIQUE (title, year)
);

-- 3. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- Performance Indexes (Conforming to Supabase Postgres Best Practices)
-- ====================================================================

-- 1. Blog Posts: Covering index to serve list/archive directly from index leaf pages (Index-Only Scan)
CREATE INDEX IF NOT EXISTS idx_blog_posts_date_covering 
ON blog_posts (date DESC) 
INCLUDE (slug, title, excerpt, cover_image);

-- Standard sorting fallback index
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts (date DESC);

-- Full-text search GIN index across title, excerpt, and content
CREATE INDEX IF NOT EXISTS idx_blog_posts_fts 
ON blog_posts USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
);

-- 2. Certificates: Composite sort index and title covering index
CREATE INDEX IF NOT EXISTS idx_certificates_year_created ON certificates (year DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_year_title 
ON certificates (year DESC, created_at DESC) 
INCLUDE (title, subtitle);

-- 3. Messages: Partial indexes for unread & important counts + covering index for timeline queries
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_important ON messages (created_at DESC) WHERE is_important = true;
CREATE INDEX IF NOT EXISTS idx_messages_created_covering 
ON messages (created_at DESC) 
INCLUDE (name, email, is_read, is_important);

-- 4. Admin Users: Covering index for constant-time credential lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_username_covering 
ON admin_users (username) 
INCLUDE (password_hash);

-- ====================================================================
-- Row-Level Security (RLS)
-- ====================================================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Public can view blog posts'
    ) THEN
        CREATE POLICY "Public can view blog posts" ON blog_posts FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Public can view certificates'
    ) THEN
        CREATE POLICY "Public can view certificates" ON certificates FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public can view site settings'
    ) THEN
        CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Public can insert contact messages'
    ) THEN
        CREATE POLICY "Public can insert contact messages" ON messages FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- ====================================================================
-- Principle of Least Privilege (Zero Data Leakage)
-- ====================================================================
REVOKE ALL ON TABLE admin_users FROM anon, authenticated, public;
REVOKE SELECT, UPDATE, DELETE, TRUNCATE ON TABLE messages FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE blog_posts FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE certificates FROM anon, authenticated, public;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE site_settings FROM anon, authenticated, public;

GRANT SELECT ON TABLE blog_posts TO anon, authenticated;
GRANT SELECT ON TABLE certificates TO anon, authenticated;
GRANT SELECT ON TABLE site_settings TO anon, authenticated;
GRANT INSERT ON TABLE messages TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
