-- Migration: 20261030000002_optimize_missing_indexes_and_trgm.sql
-- Description: Implement missing PostgreSQL indexes for RLS performance, multi-column filter/sort operations, and pg_trgm GIN search.

-- ============================================================================
-- 1. Enable Trigram Extension (pg_trgm) for Accelerated Wildcard & Substring Search
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 2. Indexes for Columns Used in RLS Policy Definitions
-- ============================================================================
-- Functional B-tree index on admin_users (id::text) to accelerate (SELECT auth.uid())::text RLS comparison
CREATE INDEX IF NOT EXISTS idx_admin_users_id_text 
ON public.admin_users ((id::text));

-- Ensure B-tree index on admin_users.username for JWT email/username matching in is_admin()
CREATE INDEX IF NOT EXISTS idx_admin_users_username_btree 
ON public.admin_users USING btree (username);

-- ============================================================================
-- 3. Composite Indexes for Admin Panel Filter + Sort Combinations
-- ============================================================================
-- Messages: Filter by status (is_read / is_important) and sort by created_at DESC
CREATE INDEX IF NOT EXISTS idx_messages_is_read_created 
ON public.messages (is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_is_important_created 
ON public.messages (is_important, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_status_composite 
ON public.messages (is_read, is_important, created_at DESC);

-- Blog Posts: Composite filter/sort by date and created_at
CREATE INDEX IF NOT EXISTS idx_blog_posts_date_created 
ON public.blog_posts (date DESC, created_at DESC);

-- Certificates: Composite sort by year and created_at
CREATE INDEX IF NOT EXISTS idx_certificates_year_created 
ON public.certificates (year DESC, created_at DESC);

-- ============================================================================
-- 4. GIN Trigram Indexes for Substring/ILIKE Search (gin_trgm_ops)
-- ============================================================================
-- A. Messages (search by sender name, contact email, or message body)
CREATE INDEX IF NOT EXISTS idx_messages_name_trgm 
ON public.messages USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_messages_email_trgm 
ON public.messages USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_messages_message_trgm 
ON public.messages USING gin (message gin_trgm_ops);

-- B. Certificates (search by title, organization/subtitle, or description)
CREATE INDEX IF NOT EXISTS idx_certificates_title_trgm 
ON public.certificates USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_certificates_subtitle_trgm 
ON public.certificates USING gin (subtitle gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_certificates_description_trgm 
ON public.certificates USING gin (description gin_trgm_ops);

-- C. Blog Posts (search by title or excerpt)
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_trgm 
ON public.blog_posts USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_blog_posts_excerpt_trgm 
ON public.blog_posts USING gin (excerpt gin_trgm_ops);

-- D. Site Settings (search by configuration key or value)
CREATE INDEX IF NOT EXISTS idx_site_settings_key_trgm 
ON public.site_settings USING gin (key gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_site_settings_value_trgm 
ON public.site_settings USING gin (value gin_trgm_ops);

