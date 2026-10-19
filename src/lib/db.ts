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
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    prepare: false, // Avoid prepared statement conflicts with Supavisor / PgBouncer
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlClient = sqlClient;
}

// Rename to dbQuery to provide backwards-compatible { rows } result
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dbQuery = async (strings: TemplateStringsArray, ...values: any[]) => {
  if (!connectionString) {
    throw new Error("POSTGRES_URL environment variable is not defined");
  }
  const result = await sqlClient(strings, ...values);
  return { rows: result };
};

/**
 * Modernized schema initialization adhering to Supabase Postgres Best Practices:
 * - BIGINT GENERATED ALWAYS AS IDENTITY primary keys (SQL standard)
 * - Native DATE and TIMESTAMPTZ data types
 * - JSONB for settings metadata
 * - Explicit UNIQUE constraints to support atomic UPSERTs
 * - Performance indexes for sorting and partial index for unread messages
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
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

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

    // 6. Performance Indexes
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts (date DESC);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_certificates_year_created ON certificates (year DESC, created_at DESC);`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (created_at DESC) WHERE is_read = false;`;
    await sqlClient`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at DESC);`;

    // 7. Enable Row Level Security (RLS)
    await sqlClient`ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;`;
    await sqlClient`ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;`;
    await sqlClient`ALTER TABLE messages ENABLE ROW LEVEL SECURITY;`;
    await sqlClient`ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;`;
    await sqlClient`ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;`;

    console.log("✅ Database tables, indexes, and RLS initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export async function checkTablesExist() {
  if (!process.env.POSTGRES_URL) return false;
  try {
    const { rows } = await dbQuery`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('blog_posts', 'certificates', 'messages', 'site_settings')
    `;
    return rows.length >= 4;
  } catch {
    return false;
  }
}
