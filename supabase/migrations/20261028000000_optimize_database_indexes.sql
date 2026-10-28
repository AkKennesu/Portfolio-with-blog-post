-- Migration: 20261028000000_optimize_database_indexes.sql
-- Description: Add covering indexes, partial indexes, and full-text search GIN index per Supabase Postgres Best Practices

-- 1. Blog Posts: Covering index to serve blog listing & homepage directly from index leaf pages (Index-Only Scan)
CREATE INDEX IF NOT EXISTS idx_blog_posts_date_covering 
ON public.blog_posts (date DESC) 
INCLUDE (slug, title, excerpt, cover_image);

-- 2. Blog Posts: Full-text search GIN index across title, excerpt, and content
CREATE INDEX IF NOT EXISTS idx_blog_posts_fts 
ON public.blog_posts USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
);

-- 3. Certificates: Covering index for year ordering with title and subtitle
CREATE INDEX IF NOT EXISTS idx_certificates_year_title 
ON public.certificates (year DESC, created_at DESC) 
INCLUDE (title, subtitle);

-- 4. Messages: Covering index for timeline queries
CREATE INDEX IF NOT EXISTS idx_messages_created_covering 
ON public.messages (created_at DESC) 
INCLUDE (name, email, is_read, is_important);

-- 5. Messages: Partial index for important messages
CREATE INDEX IF NOT EXISTS idx_messages_important 
ON public.messages (created_at DESC) 
WHERE is_important = true;

-- 6. Admin Users: Covering index for authentication
CREATE INDEX IF NOT EXISTS idx_admin_users_username_covering 
ON public.admin_users (username) 
INCLUDE (password_hash);

-- Refresh table planner statistics
ANALYZE public.blog_posts, public.certificates, public.messages, public.site_settings, public.admin_users;

