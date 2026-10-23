# Modern Full-Stack Portfolio & CMS

A premium, high-performance portfolio website built with **Next.js 15**, featuring a custom-built **Content Management System (CMS)** and stunning **3D animations**.

## Overview

This project is more than just a portfolio; it's a complete personal brand platform. It includes a secure Administrative Dashboard to manage blog posts, professional certificates, and visitor inquiries in real-time without redeploying code.

## Key Features

- **Dynamic CMS**: Full CRUD (Create, Read, Update, Delete) for Blog Posts and Certificates.
- **Messaging System**: Dedicated "Message Center" in the admin panel to read, flag, and manage visitor inquiries.
- **3D Interactive UI**: Experience-driven design using **Three.js** and **GSAP** for fluid transitions and 3D profile effects.
- **Secure Admin Panel**: Protected by JWT-based authentication and secure session management.
- **Responsive Design**: Fully optimized for all devices with a "Glassmorphic" dark-themed aesthetic.
- **Database Persistence**: Powered by **PostgreSQL** (via Supabase/Vercel) using the universal `postgres.js` client.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Lucide Icons
- **Animations**: Three.js, GSAP, Framer Motion, and Lenis (Smooth Scroll)
- **Database**: PostgreSQL (Supabase / Vercel Postgres)
- **Authentication**: JWT & HTTP-only Cookies
- **Validation**: Zod (Schema validation for all forms)

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

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your PostgreSQL connection string:

```env
POSTGRES_URL="your-postgresql-connection-string"
JWT_SECRET="your-random-secret-string"
ADMIN_PASSWORD="your-secure-admin-password"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## Deployment

### Database Initialization

Once deployed (e.g., on Vercel), navigate to `/admin/dashboard` and click **"Initialize Tables"**. This will automatically create the:

- `blog_posts` table
- `certificates` table
- `messages` table
- `admin_users` table

### Data Migration

If you have existing static data, you can use the **"Sync with Static Data"** button in the dashboard to migrate your local records into your live database instantly.

---

Built by [Arn Kenneth](https://github.com/AkKennesu)
