import postgres from "postgres";

// Use postgres.js client which works with standard Postgres protocols (Supabase, Neon, etc.)
const connectionString = process.env.POSTGRES_URL || "";

const sqlClient = postgres(connectionString, {
  ssl: "require",
  // For serverless, we want to close connections quickly
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

// Rename to dbQuery to avoid naming collisions with @vercel/postgres 'sql'
export const dbQuery = async (strings: TemplateStringsArray, ...values: unknown[]) => {
  const result = await sqlClient(strings, ...values);
  return { rows: result };
};

export async function initDb() {
  if (!process.env.POSTGRES_URL) {
    console.log("Postgres connection string missing, skipping table initialization");
    return;
  }
  console.log("🔌 Initializing Database with postgres.js client...");
  try {
    // Create Blog Posts Table
    await dbQuery`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        date TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Certificates Table
    await dbQuery`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        year TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Admin Users Table
    await dbQuery`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Database tables initialized successfully");
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
      WHERE schemaname != 'pg_catalog' 
      AND schemaname != 'information_schema'
      AND tablename IN ('blog_posts', 'certificates')
    `;
    return rows.length >= 2;
  } catch {
    return false;
  }
}
