-- Migration: 20261030000000_get_admin_dashboard_stats.sql
-- Description: Consolidated PostgreSQL RPC function for real-time admin overview KPIs, chart aggregations, and feeds.

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin boolean := false;
  v_result jsonb;
BEGIN
  -- 1. Verify caller has administrative privileges
  -- Check 1: Superuser / direct database connection (service_role, postgres)
  IF current_user IN ('postgres', 'service_role') THEN
    v_is_admin := true;
  -- Check 2: Supabase Auth service_role token
  ELSIF coalesce(auth.jwt() ->> 'role', '') = 'service_role' THEN
    v_is_admin := true;
  -- Check 3: Supabase Auth custom claims in app_metadata or user_metadata
  ELSIF coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' 
     OR coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin' THEN
    v_is_admin := true;
  -- Check 4: Request JWT claim role = 'admin'
  ELSIF coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'admin' THEN
    v_is_admin := true;
  END IF;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied: caller does not possess administrative privileges'
      USING ERRCODE = '42501'; -- insufficient_privilege
  END IF;

  -- 2. Compute all counts, group-by metrics, and recent feeds in a single atomic JSON execution plan
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

-- Revoke execution from public & anonymous callers; grant only to authenticated and service_role
REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated, service_role;

