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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // 6. Performance Indexes (Covering, Partial, and GIN)
    // Blog Posts: Covering index to serve list/archive directly from index leaf pages (Index-Only Scan)
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_date_covering 
      ON blog_posts (date DESC) 
      INCLUDE (slug, title, excerpt, cover_image);
    `;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts (date DESC);`;

    // Blog Posts: Full-text search GIN index
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_fts 
      ON blog_posts USING gin (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
      );
    `;

    // Certificates: Composite and Covering index
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_certificates_year_created ON certificates (year DESC, created_at DESC);`;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_certificates_year_title 
      ON certificates (year DESC, created_at DESC) 
      INCLUDE (title, subtitle);
    `;

    // Messages: Partial indexes for unread & important counts + covering index
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (created_at DESC) WHERE is_read = false;`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_important ON messages (created_at DESC) WHERE is_important = true;`;
    await sqlClient`
      CREATE INDEX IF NOT EXISTS idx_messages_created_covering 
      ON messages (created_at DESC) 
      INCLUDE (name, email, is_read, is_important);
    `;

    // Admin Users: Covering index for authentication
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

    // 8. RLS Policies and Least Privilege Grants
    await sqlClient`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Public can view blog posts') THEN
          CREATE POLICY "Public can view blog posts" ON blog_posts FOR SELECT TO anon, authenticated USING (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Public can view certificates') THEN
          CREATE POLICY "Public can view certificates" ON certificates FOR SELECT TO anon, authenticated USING (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public can view site settings') THEN
          CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Public can insert contact messages') THEN
          CREATE POLICY "Public can insert contact messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
        END IF;
      END $$;
    `;

    await sqlClient`
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
