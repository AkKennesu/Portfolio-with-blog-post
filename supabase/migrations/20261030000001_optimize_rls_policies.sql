-- Migration: 20261030000001_optimize_rls_policies.sql
-- Description: Optimize Row-Level Security (RLS) policies for maximum query performance and security:
-- 1. Create a STABLE SECURITY DEFINER helper function `public.is_admin()` with SET search_path = ''
-- 2. Wrap all auth.uid(), auth.jwt(), and role checks in scalar subqueries `(SELECT ...)` to trigger PostgreSQL InitPlan caching (O(1) evaluation instead of O(N) per-row calls)
-- 3. Explicitly scope protected policies to `TO authenticated` so anonymous requests short-circuit at the role gate without evaluating expressions
-- 4. Recreate clean, indexed, and optimized policies for blog_posts, certificates, site_settings, messages, and admin_users

-- ============================================================================
-- 1. Fast, Cached Admin Check Helper Function (InitPlan Compatible)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    -- Direct backend connection (postgres superuser) when outside simulated JWT sessions
    (session_user = 'postgres' AND (SELECT auth.role()) IS NULL)
    -- Supabase service_role token
    OR (SELECT auth.role()) = 'service_role'
    -- Admin role claim in Supabase Auth JWT (app_metadata or user_metadata)
    OR coalesce((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    OR coalesce((SELECT auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
    OR coalesce((SELECT nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'), '') = 'admin'
    -- Admin lookup in admin_users table by email or user ID
    OR (
      (SELECT auth.uid()) IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE username = (SELECT auth.jwt() ->> 'email')
           OR id::text = (SELECT auth.uid())::text
      )
    )
  );
$$;

-- Secure function execution grants
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- ============================================================================
-- 2. Update Admin Dashboard Stats RPC to reuse public.is_admin()
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Access denied: caller does not possess administrative privileges'
      USING ERRCODE = '42501'; -- insufficient_privilege
  END IF;

  SELECT jsonb_build_object(
    'kpis', jsonb_build_object(
      'blog_count', (SELECT count(*) FROM public.blog_posts),
      'cert_count', (SELECT count(*) FROM public.certificates),
      'message_count', (SELECT count(*) FROM public.messages),
      'unread_message_count', (SELECT count(*) FROM public.messages WHERE is_read = false)
    ),
    'aggregations', jsonb_build_object(
      'messages_by_status', jsonb_build_object(
        'unread', (SELECT count(*) FROM public.messages WHERE is_read = false),
        'read', (SELECT count(*) FROM public.messages WHERE is_read = true)
      ),
      'certs_by_year', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('year', year, 'count', count))
        FROM (
          SELECT year, count(*) AS count
          FROM public.certificates
          GROUP BY year
          ORDER BY year DESC
        ) cy
      ), '[]'::jsonb),
      'monthly_inquiries', COALESCE((
        SELECT jsonb_agg(jsonb_build_object('month', month, 'count', count))
        FROM (
          SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, count(*) AS count
          FROM public.messages
          GROUP BY date_trunc('month', created_at)
          ORDER BY date_trunc('month', created_at) DESC
          LIMIT 6
        ) mi
      ), '[]'::jsonb)
    ),
    'recent_messages', COALESCE((
      SELECT jsonb_agg(m)
      FROM (
        SELECT 
          id, 
          name, 
          email, 
          substring(message from 1 for 100) AS snippet, 
          is_read, 
          to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
        FROM public.messages 
        ORDER BY created_at DESC 
        LIMIT 4
      ) m
    ), '[]'::jsonb),
    'recent_posts', COALESCE((
      SELECT jsonb_agg(p)
      FROM (
        SELECT 
          id, 
          title, 
          slug, 
          to_char(date, 'YYYY-MM-DD') AS date
        FROM public.blog_posts 
        ORDER BY date DESC 
        LIMIT 3
      ) p
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated, service_role;

-- ============================================================================
-- 3. Drop Legacy & Existing Policies
-- ============================================================================
DROP POLICY IF EXISTS "Public can view blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_select_public" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_insert" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_update" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_delete" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_all" ON public.blog_posts;

DROP POLICY IF EXISTS "Public can view certificates" ON public.certificates;
DROP POLICY IF EXISTS "certificates_select_public" ON public.certificates;
DROP POLICY IF EXISTS "certificates_admin_insert" ON public.certificates;
DROP POLICY IF EXISTS "certificates_admin_update" ON public.certificates;
DROP POLICY IF EXISTS "certificates_admin_delete" ON public.certificates;
DROP POLICY IF EXISTS "certificates_admin_all" ON public.certificates;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin_insert" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin_update" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin_delete" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin_all" ON public.site_settings;

DROP POLICY IF EXISTS "Public can insert contact messages" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_public" ON public.messages;
DROP POLICY IF EXISTS "messages_admin_select" ON public.messages;
DROP POLICY IF EXISTS "messages_admin_update" ON public.messages;
DROP POLICY IF EXISTS "messages_admin_delete" ON public.messages;
DROP POLICY IF EXISTS "messages_admin_all" ON public.messages;

DROP POLICY IF EXISTS "admin_users_admin_select" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_admin_insert" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_admin_update" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_admin_delete" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_admin_all" ON public.admin_users;

-- Ensure RLS is active on all tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. Recreate Optimized RLS Policies
-- ============================================================================

-- --- A. Blog Posts ---
-- Public read access
CREATE POLICY "blog_posts_select_public" 
  ON public.blog_posts 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Admin mutation policies (gated to authenticated role, cached via InitPlan)
CREATE POLICY "blog_posts_admin_insert" 
  ON public.blog_posts 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "blog_posts_admin_update" 
  ON public.blog_posts 
  FOR UPDATE 
  TO authenticated 
  USING ((SELECT public.is_admin())) 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "blog_posts_admin_delete" 
  ON public.blog_posts 
  FOR DELETE 
  TO authenticated 
  USING ((SELECT public.is_admin()));


-- --- B. Certificates ---
-- Public read access
CREATE POLICY "certificates_select_public" 
  ON public.certificates 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Admin mutation policies
CREATE POLICY "certificates_admin_insert" 
  ON public.certificates 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "certificates_admin_update" 
  ON public.certificates 
  FOR UPDATE 
  TO authenticated 
  USING ((SELECT public.is_admin())) 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "certificates_admin_delete" 
  ON public.certificates 
  FOR DELETE 
  TO authenticated 
  USING ((SELECT public.is_admin()));


-- --- C. Site Settings ---
-- Public read access
CREATE POLICY "site_settings_select_public" 
  ON public.site_settings 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Admin mutation policies
CREATE POLICY "site_settings_admin_insert" 
  ON public.site_settings 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "site_settings_admin_update" 
  ON public.site_settings 
  FOR UPDATE 
  TO authenticated 
  USING ((SELECT public.is_admin())) 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "site_settings_admin_delete" 
  ON public.site_settings 
  FOR DELETE 
  TO authenticated 
  USING ((SELECT public.is_admin()));


-- --- D. Contact Messages ---
-- Public submission (insert only)
CREATE POLICY "messages_insert_public" 
  ON public.messages 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Admin inspection & management policies (gated to authenticated role)
CREATE POLICY "messages_admin_select" 
  ON public.messages 
  FOR SELECT 
  TO authenticated 
  USING ((SELECT public.is_admin()));

CREATE POLICY "messages_admin_update" 
  ON public.messages 
  FOR UPDATE 
  TO authenticated 
  USING ((SELECT public.is_admin())) 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "messages_admin_delete" 
  ON public.messages 
  FOR DELETE 
  TO authenticated 
  USING ((SELECT public.is_admin()));


-- --- E. Admin Users ---
-- Strictly protected: only authenticated admins can view and manage
CREATE POLICY "admin_users_admin_select" 
  ON public.admin_users 
  FOR SELECT 
  TO authenticated 
  USING ((SELECT public.is_admin()));

CREATE POLICY "admin_users_admin_insert" 
  ON public.admin_users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "admin_users_admin_update" 
  ON public.admin_users 
  FOR UPDATE 
  TO authenticated 
  USING ((SELECT public.is_admin())) 
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "admin_users_admin_delete" 
  ON public.admin_users 
  FOR DELETE 
  TO authenticated 
  USING ((SELECT public.is_admin()));

-- ============================================================================
-- 5. Principle of Least Privilege: Role Grants and Permissions
-- ============================================================================

-- A. Anonymous Role (anon): Read-only on public content + insert on contact form
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON TABLE public.blog_posts, public.certificates, public.site_settings TO anon;
GRANT INSERT ON TABLE public.messages TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- B. Authenticated Role (authenticated): Granted table access, filtered strictly by RLS
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE 
  public.blog_posts, 
  public.certificates, 
  public.site_settings, 
  public.messages, 
  public.admin_users 
TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

