# Modern Full-Stack Portfolio, Blog & CMS

A high-performance, design-forward personal brand platform built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS v4**, **Three.js / GSAP**, and **PostgreSQL on Supabase**.

Featuring an enterprise-grade **Clean Architecture** (Repository-Service-Server Action pattern), strict **Database Security** with Row-Level Security (RLS) and connection pooling, dynamic site customization, and a comprehensive **Administrative CMS** with multi-select batch operations.

---

## 🚀 Key Highlights & What's New

### 🛡️ Enterprise Clean Architecture & Performance
- **Repository-Service-Action Pattern**: Completely decoupled architecture separating raw SQL data access (`src/repositories/`), business logic (`src/services/`), and type-safe server actions (`src/actions/`).
- **Request Deduplication**: Powered by React 19's `cache()` in repositories to eliminate duplicate database queries across layout and component render trees.
- **Single-Hop Aggregation**: Dashboard metrics and recent previews load in a single network roundtrip using PostgreSQL CTEs and `json_agg()`.
- **Atomic Operations**: Single-statement batch upserts for settings and certificates with `ON CONFLICT` clauses.

### 🔒 Supabase & PostgreSQL Hardened Security
- **Transaction Connection Pooling**: Configured for Supabase's transaction pooler (Supavisor on port 6543) with `prepare: false` to prevent prepared-statement collisions on edge/serverless runtimes.
- **Row-Level Security (RLS)**: Active across all tables (`blog_posts`, `certificates`, `messages`, `site_settings`, `admin_users`).
- **Principle of Least Privilege**: Anonymous users have zero read/write access to administrative records, read-only access to published content, and insert-only access for contact inquiries.
- **Strict Data Integrity**: Modern schema using `BIGINT GENERATED ALWAYS AS IDENTITY`, native `DATE` and `TIMESTAMPTZ` types, year validation constraints (`CHECK (year BETWEEN 1970 AND 2100)`), and partial indexes for unread messages.
- **Declarative Migrations**: Version-controlled SQL migrations located in `supabase/migrations/`.

### 📰 Overhauled Blog Experience
- **Live Search & Category Filtering**: Instant client-side search across titles, excerpts, and content with dynamic category pills (TypeScript, Performance, Security, Design Systems, Frontend Architecture, etc.).
- **Hero Article Spotlight**: Automatic featured presentation for the latest article.
- **Reading Time & Date Formatting**: Automatic WPM-based read time calculation and UTC-safe date presentation.
- **Social Sharing Toolbar**: Interactive floating share bar supporting X/Twitter, LinkedIn, and one-click link copying with real-time reading scroll progress.
- **Prose Typography**: Tailored typography with code block styling and dark glassmorphic aesthetics.

### 🎨 Dynamic Site Customization & Personal Info Hub
- **Unified Settings Console (`/admin/settings`)**:
  - **Dynamic Copy**: Edit About Me paragraphs directly from the admin panel.
  - **Brand Accent Color**: Live color picker to dynamically customize the portfolio's primary accent hue.
  - **Dynamic CV Management**: Upload and update your resume/CV (PDF) with instant public download and viewer integration.
  - **Custom Social Links Manager**: Dynamically add, reorder, and configure custom social buttons with brand-specific hover color glows (GitHub, LinkedIn, Twitter/X, Discord, YouTube, Facebook, Twitch, Instagram, Email, Website).

### ⚡ Batch Operations & Admin Console
- **Multi-Select Batch Deletions**: Bulk delete articles, certificates, or contact messages simultaneously with confirmation safeguards.
- **Sticky / Fixed Admin Navigation**: Persistent desktop sidebar and mobile-optimized slideout navigation.
- **Contact Message Center**: Read, filter unread, star as important, and manage visitor messages in real-time.
- **Edge Route Protection**: Next.js Edge Middleware protecting all `/admin/*` routes with JWT session verification (`jose`), constant-time password validation, and automatic redirects.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/) |
| **3D & Motion** | [Three.js](https://threejs.org/), [GSAP](https://gsap.com/), [Framer Motion](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) on [Supabase](https://supabase.com/) |
| **DB Client** | [postgres.js](https://github.com/porsager/postgres) (Supavisor Transaction Pooler) |
| **Auth & Security** | [jose](https://github.com/panva/jose) (JWT), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), Next.js Middleware |
| **Validation & Sanitization** | [Zod](https://zod.dev/) & [sanitize-html](https://github.com/apostrophecms/sanitize-html) |

---

## 📂 Project Architecture

```
Portfolio-with-blog-post/
├── .agents/                    # Workspace agent guidelines & design taste skills
├── supabase/
│   └── migrations/             # Versioned SQL migrations (RLS, constraints, indexes)
├── src/
│   ├── actions/                # Next.js Server Actions (Zod validation, HTML sanitization)
│   │   ├── admin.ts            # Auth, data sync, and database initialization actions
│   │   ├── blog.ts             # Blog CRUD and batch deletion actions
│   │   ├── certificates.ts     # Certificate CRUD and batch deletion actions
│   │   ├── contact.ts          # Public contact form action
│   │   ├── messages.ts         # Message status and batch deletion actions
│   │   └── settings.ts         # Site settings and personal info update actions
│   ├── app/                    # Next.js 15 App Router
│   │   ├── admin/              # Protected admin dashboard, blog, certs, messages, settings
│   │   ├── api/                # API routes (contact endpoint)
│   │   ├── blog/               # Public blog listing and [slug] reader
│   │   ├── globals.css         # Tailwind CSS v4 styling rules
│   │   ├── layout.tsx          # Root layout with dynamic theme and settings provider
│   │   └── page.tsx            # Main portfolio one-page experience
│   ├── components/             # Reusable UI & 3D components
│   │   ├── admin/              # Unified admin console, batch delete toolbar, forms
│   │   ├── ui/                 # UI primitives
│   │   ├── BlogList.tsx        # Blog search, category filter, and card grids
│   │   ├── BlogShareToolbar.tsx# Social share bar and scroll indicator
│   │   ├── ProfileTransition.tsx # Three.js interactive 3D profile
│   │   └── SpotlightBackground.tsx # Dynamic fluid / spotlight shader effects
│   ├── hooks/                  # Client React hooks (active section, scroll)
│   ├── lib/                    # Core utilities & database config
│   │   ├── auth.ts             # JWT token generation, cookie sessions, password verify
│   │   ├── blog-utils.ts       # Reading time estimator, categories, date formatter
│   │   ├── db.ts               # Postgres singleton pooler client and initDb()
│   │   ├── errors.ts           # Standardized error classes and safe response mapping
│   │   ├── sanitize.ts         # Server-side HTML input sanitization
│   │   └── schema.sql          # Canonical reference schema with RLS policies
│   ├── repositories/           # Data Access Layer (Raw SQL, React.cache(), CTE queries)
│   │   ├── admin.repo.ts
│   │   ├── blog.repo.ts
│   │   ├── certificate.repo.ts
│   │   ├── message.repo.ts
│   │   ├── metrics.repo.ts
│   │   └── settings.repo.ts
│   ├── services/               # Business logic & domain transformation layer
│   │   ├── blog.service.ts
│   │   ├── certificate.service.ts
│   │   ├── contact.service.ts
│   │   └── settings.service.ts
│   └── middleware.ts           # Edge JWT authentication guard for /admin/* routes
```

---

## Installation & Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/AkKennesu/Portfolio-with-blog-post.git
cd Portfolio-with-blog-post
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory (refer to `.env.example`):

```env
# 1. Supabase Public Client Credentials
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# 2. PostgreSQL Connection String
# Use Supavisor transaction pooler (port 6543) with sslmode=require for serverless & edge runtimes
POSTGRES_URL="postgresql://postgres.your-project-ref:[YOUR_DB_PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require"

# 3. JWT Secret for Admin Session Signing (Cryptographically random 32+ character string)
JWT_SECRET="generate-a-secure-random-32-character-secret"

# 4. Admin Dashboard Master Password
ADMIN_PASSWORD="your-secure-admin-password-here"
```

> [!TIP]
> **Supabase Connection Pooling**: Always connect to Supabase through the **Transaction Pooler** (`port 6543` with `?sslmode=require`). The database client in `src/lib/db.ts` is pre-configured with `prepare: false` to ensure compatibility with serverless runtimes.

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

---

## 🗄️ Database Setup & Provisioning

You have two simple options to initialize and populate the database:

### Option A: In-Dashboard One-Click Setup (Recommended)
1. Start the app and navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Enter your configured `ADMIN_PASSWORD` to log in.
3. On the **Admin Dashboard**, click **"Initialize Database"**. This will automatically create:
   - `blog_posts` table
   - `certificates` table
   - `admin_users` table
   - `messages` table
   - `site_settings` table
   - Performance indexes (date, certificate year, partial unread index)
   - Row-Level Security (RLS) policies and least-privilege role grants
4. Click **"Sync with Static Data"** to automatically seed your database with the pre-configured blog articles and certificates from local files.

### Option B: Supabase CLI / Direct SQL
You can also run the migrations directly against your Supabase project:
```bash
# Push versioned migrations to your linked Supabase project
npx supabase db push
```
Or copy the SQL commands from [`src/lib/schema.sql`](file:///c:/Users/arnke/OneDrive/Tài%20liệu/github%20projects/portfolio/Portfolio-with-blog-post/src/lib/schema.sql) directly into the Supabase SQL Editor.

---

## 🎛️ Administrative CMS Guide

| Section | Route | Capabilities |
|---|---|---|
| **Overview Dashboard** | `/admin/dashboard` | Real-time counts, unread messages indicator, recent activity previews, database initialization, and static data sync. |
| **Personal Info / Settings** | `/admin/settings` | Edit About Me paragraphs, live brand accent color picker, dynamic CV upload, and social links manager with brand hover glows. |
| **Blog Manager** | `/admin/blog` | Create, edit, preview, delete, and multi-select **batch delete** blog articles. |
| **Certificates** | `/admin/certificates` | Manage credentials, issue years, credential images, and perform **batch deletions**. |
| **Messages Center** | `/admin/messages` | Read visitor inquiries, toggle unread/read states, star priority messages, and **batch delete** contact submissions. |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Next.js development server with **Turbopack** enabled |
| `npm run dev:webpack` | Runs the development server with standard Webpack fallback |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts the production Next.js server |
| `npm run lint` | Runs ESLint checks across the codebase |

---

## 🛡️ Security Architecture

- **Edge Authentication**: Protected routes (`/admin/*`) are verified at the edge before rendering via Next.js Middleware with cryptographic HMAC SHA-256 JWT checks.
- **Timing Attack Prevention**: Constant-time password comparison protects against timing exploration attacks on `/admin/login`.
- **HTML Sanitization**: All content inputs (blog markdown/HTML, contact submissions) are sanitized via `sanitize-html` before reaching database insertion or UI display.
- **Schema-Enforced Validation**: All Server Actions rigorously validate inputs against strict Zod schemas before hitting the repository layer.
- **Zero-Trust Database Grants**: Anonymous and authenticated users are stripped of all privileges on admin credentials and contact submissions; public reads are restricted solely to published blogs and credentials.

---

## 👤 Author

Built with ❤️ by **[Arn Kenneth](https://github.com/AkKennesu)**
- GitHub: [@AkKennesu](https://github.com/AkKennesu)
