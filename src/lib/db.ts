import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || "";

// Supabase & Postgres Connection Pooling Configuration:
// 1. prepare: false is mandatory when connecting via transaction-mode poolers (Supabase port 6543 / Supavisor)
// 2. max: 1 in dev to prevent pool exhaustion across fast reloads
// 3. Global singleton pattern to survive Next.js module hot-reloading
const globalForDb = globalThis as unknown as {
  sqlClient: postgres.Sql | undefined;
};

export const sqlClient =
  globalForDb.sqlClient ??
  postgres(connectionString, {
    ssl: "require",
    max: process.env.NODE_ENV === "production" ? 10 : 1,
    idle_timeout: 15, // Reclaim idle connections quickly before Supavisor pooler drops them
    max_lifetime: 60 * 5, // 5 minutes max connection lifetime
    connect_timeout: 10,
    prepare: false, // Mandatory for Supavisor / PgBouncer transaction-mode pooler
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlClient = sqlClient;
}

// Rename to dbQuery to provide backwards-compatible { rows } result with automatic recovery
export const dbQuery = async (strings: TemplateStringsArray, ...values: any[]) => {
  if (!connectionString) {
    throw new Error("POSTGRES_URL environment variable is not defined");
  }
  try {
    const result = await sqlClient(strings, ...values);
    return { rows: result };
  } catch (error: unknown) {
    // Check if error is due to an idle connection dropped by Supabase's transaction pooler
    const err = error as { code?: string; message?: string };
    const isConnDropped =
      err?.code === "CONNECTION_CLOSED" ||
      err?.code === "ECONNRESET" ||
      err?.code === "EPIPE" ||
      String(err?.message).includes("CONNECTION_CLOSED") ||
      String(err?.message).includes("connection closed");

    if (isConnDropped) {
      console.warn("Database connection dropped by pooler. Retrying query on a fresh connection...");
      const retryResult = await sqlClient(strings, ...values);
      return { rows: retryResult };
    }
    throw error;
  }
};

/**
 * Modernized schema initialization adhering to Supabase Postgres Best Practices:
 * - BIGINT GENERATED ALWAYS AS IDENTITY primary keys (SQL standard)
 * - Native DATE and TIMESTAMPTZ data types
 * - JSONB for settings metadata
 * - Explicit UNIQUE constraints to support atomic UPSERTs
 * - Performance covering indexes (Index-Only Scans) and partial indexes
 * - Full-Text Search GIN index on blog articles
 * - Row Level Security (RLS) enabled on all tables
 */
export async function initDb() {
  if (!process.env.POSTGRES_URL) {
    console.log("Postgres connection string missing, skipping table initialization");
    return;
  }
  console.log("🔌 Initializing Database with Supabase & Postgres best practices...");
  try {
    // 1. Blog Posts Table
    await sqlClient`
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
    `;
    await sqlClient`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;`;

    // 2. Certificates Table
    await sqlClient`
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
    `;

    // 3. Admin Users Table
    await sqlClient`
      CREATE TABLE IF NOT EXISTS admin_users (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Messages Table
    await sqlClient`
      CREATE TABLE IF NOT EXISTS messages (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        is_important BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Site Settings Table
    await sqlClient`
      CREATE TABLE IF NOT EXISTS site_settings (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Performance Indexes (Covering, Partial, Composite, and pg_trgm GIN)
    await sqlClient`CREATE EXTENSION IF NOT EXISTS pg_trgm;`;

    // Blog Posts: Date index, composite index, covering index, full-text & trigram indexes
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts (date DESC);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_blog_posts_date_created ON blog_posts (date DESC, created_at DESC);`;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_date_covering 
      ON blog_posts (date DESC) 
      INCLUDE (slug, title, excerpt, cover_image);
    `;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_fts 
      ON blog_posts USING gin (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
      );
    `;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_blog_posts_title_trgm ON blog_posts USING gin (title gin_trgm_ops);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_blog_posts_excerpt_trgm ON blog_posts USING gin (excerpt gin_trgm_ops);`;

    // Certificates: Composite and Covering index + trigram search indexes
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_certificates_year_created ON certificates (year DESC, created_at DESC);`;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_certificates_year_title 
      ON certificates (year DESC, created_at DESC) 
      INCLUDE (title, subtitle);
    `;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_certificates_title_trgm ON certificates USING gin (title gin_trgm_ops);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_certificates_subtitle_trgm ON certificates USING gin (subtitle gin_trgm_ops);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_certificates_description_trgm ON certificates USING gin (description gin_trgm_ops);`;

    // Messages: Status composite indexes, partial indexes + covering index + trigram search indexes
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (created_at DESC) WHERE is_read = false;`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_important ON messages (created_at DESC) WHERE is_important = true;`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_is_read_created ON messages (is_read, created_at DESC);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_is_important_created ON messages (is_important, created_at DESC);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_status_composite ON messages (is_read, is_important, created_at DESC);`;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_messages_created_covering 
      ON messages (created_at DESC) 
      INCLUDE (name, email, is_read, is_important);
    `;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_name_trgm ON messages USING gin (name gin_trgm_ops);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_email_trgm ON messages USING gin (email gin_trgm_ops);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_message_trgm ON messages USING gin (message gin_trgm_ops);`;

    // Site Settings: Trigram indexes for key/value search
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_site_settings_key_trgm ON site_settings USING gin (key gin_trgm_ops);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_site_settings_value_trgm ON site_settings USING gin (value gin_trgm_ops);`;

    // Admin Users: Functional and covering indexes for authentication & RLS
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_admin_users_id_text ON admin_users ((id::text));`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_admin_users_username_btree ON admin_users USING btree (username);`;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_admin_users_username_covering 
      ON admin_users (username) 
      INCLUDE (password_hash);
    `;

    // 7. Enable Row Level Security (RLS)
    await sqlClient`ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;`;
    await sqlClient`ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;`;
    await sqlClient`ALTER TABLE messages ENABLE ROW LEVEL SECURITY;`;
    await sqlClient`ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;`;
    await sqlClient`ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;`;

    // 8. RLS Policies and Performance-Optimized Admin Functions
    await sqlClient`
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path = ''
      AS $$
        SELECT (
          (session_user = 'postgres' AND (SELECT auth.role()) IS NULL)
          OR (SELECT auth.role()) = 'service_role'
          OR coalesce((SELECT auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
          OR coalesce((SELECT auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
          OR coalesce((SELECT nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'), '') = 'admin'
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

      REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
      GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
    `;

    await sqlClient`
      -- Drop legacy policies
      DROP POLICY IF EXISTS "Public can view blog posts" ON blog_posts;
      DROP POLICY IF EXISTS "Public can view certificates" ON certificates;
      DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
      DROP POLICY IF EXISTS "Public can insert contact messages" ON messages;

      -- Blog Posts: Public read, authenticated admin write (cached via InitPlan)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'blog_posts_select_public') THEN
          CREATE POLICY "blog_posts_select_public" ON blog_posts FOR SELECT TO anon, authenticated USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'blog_posts_admin_insert') THEN
          CREATE POLICY "blog_posts_admin_insert" ON blog_posts FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'blog_posts_admin_update') THEN
          CREATE POLICY "blog_posts_admin_update" ON blog_posts FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'blog_posts_admin_delete') THEN
          CREATE POLICY "blog_posts_admin_delete" ON blog_posts FOR DELETE TO authenticated USING ((SELECT public.is_admin()));
        END IF;

        -- Certificates
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'certificates_select_public') THEN
          CREATE POLICY "certificates_select_public" ON certificates FOR SELECT TO anon, authenticated USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'certificates_admin_insert') THEN
          CREATE POLICY "certificates_admin_insert" ON certificates FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'certificates_admin_update') THEN
          CREATE POLICY "certificates_admin_update" ON certificates FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'certificates_admin_delete') THEN
          CREATE POLICY "certificates_admin_delete" ON certificates FOR DELETE TO authenticated USING ((SELECT public.is_admin()));
        END IF;

        -- Site Settings
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'site_settings_select_public') THEN
          CREATE POLICY "site_settings_select_public" ON site_settings FOR SELECT TO anon, authenticated USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'site_settings_admin_insert') THEN
          CREATE POLICY "site_settings_admin_insert" ON site_settings FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'site_settings_admin_update') THEN
          CREATE POLICY "site_settings_admin_update" ON site_settings FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'site_settings_admin_delete') THEN
          CREATE POLICY "site_settings_admin_delete" ON site_settings FOR DELETE TO authenticated USING ((SELECT public.is_admin()));
        END IF;

        -- Messages
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_insert_public') THEN
          CREATE POLICY "messages_insert_public" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_admin_select') THEN
          CREATE POLICY "messages_admin_select" ON messages FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_admin_update') THEN
          CREATE POLICY "messages_admin_update" ON messages FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_admin_delete') THEN
          CREATE POLICY "messages_admin_delete" ON messages FOR DELETE TO authenticated USING ((SELECT public.is_admin()));
        END IF;

        -- Admin Users
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'admin_users_admin_select') THEN
          CREATE POLICY "admin_users_admin_select" ON admin_users FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'admin_users_admin_insert') THEN
          CREATE POLICY "admin_users_admin_insert" ON admin_users FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'admin_users_admin_update') THEN
          CREATE POLICY "admin_users_admin_update" ON admin_users FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'admin_users_admin_delete') THEN
          CREATE POLICY "admin_users_admin_delete" ON admin_users FOR DELETE TO authenticated USING ((SELECT public.is_admin()));
        END IF;
      END $$;
    `;

    await sqlClient`
      REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
      GRANT SELECT ON TABLE blog_posts, certificates, site_settings TO anon;
      GRANT INSERT ON TABLE messages TO anon;
      GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

      REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE blog_posts, certificates, site_settings, messages, admin_users TO authenticated;
      GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    `;

    // 9. PostgreSQL RPC Function for Admin Dashboard Stats
    await sqlClient`
      CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, auth
      AS $
      DECLARE
        v_result jsonb;
      BEGIN
        IF NOT (SELECT public.is_admin()) THEN
          RAISE EXCEPTION 'Access denied: caller does not possess administrative privileges'
            USING ERRCODE = '42501';
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
      $;

      REVOKE ALL ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC, anon;
      GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated, service_role;
    `;

    console.log("✅ Database tables, indexes, RLS, and secure policies initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

let cachedTablesVerified = false;

export async function checkTablesExist() {
  if (cachedTablesVerified) return true;
  if (!process.env.POSTGRES_URL) return false;
  try {
    const { rows } = await dbQuery`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('blog_posts', 'certificates', 'messages', 'site_settings')
    `;
    const exists = rows.length >= 4;
    if (exists) cachedTablesVerified = true;
    return exists;
  } catch {
    return false;
  }
}
