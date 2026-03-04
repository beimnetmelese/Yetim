# YetimTools

Production-ready React + TypeScript + Tailwind frontend using Supabase for:

- Email/password authentication
- Postgres database (posts, categories, site_stats)
- Storage bucket for post images
- Row Level Security (RLS)

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase JS SDK
- React Router

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create local env file

```bash
cp .env.example .env
```

3. Fill `.env` values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. Open Supabase SQL Editor and run:

- `supabase/schema.sql`

5. Start app

```bash
npm run dev
```

## Supabase Deliverables Included

- SQL schema: `supabase/schema.sql`
- RLS policies for all required tables
- Postgres function: `increment_site_visits()`
- Storage bucket + storage policies for `posts`

## App Features

- Auth page with login + signup (email/password)
- Protected routes:
  - `/dashboard`
  - `/posts`
  - `/categories`
- Dashboard cards:
  - Daily, Weekly, Monthly, Yearly Active Users
  - Total Posts
  - Total Categories
  - Total Site Visits
- Posts CRUD:
  - Name, Price, Description, Category
  - Image upload to Supabase Storage (`posts` bucket)
  - Edit/Delete own posts
- Categories CRUD:
  - Create, list, edit, delete

## Folder Structure

```text
src/
  components/
    AppLayout.tsx
    LoadingScreen.tsx
    ProtectedRoute.tsx
  context/
    AuthContext.tsx
  lib/
    supabase.ts
  pages/
    CategoriesPage.tsx
    DashboardPage.tsx
    LoginPage.tsx
    PostsPage.tsx
  types/
    database.ts
  App.tsx
  index.css
  main.tsx
supabase/
  schema.sql
```

## Security Notes

- Frontend uses only Supabase anon key.
- `service_role` key is not used in client code.
- RLS is enabled for all app tables.
- Ownership checks use `auth.uid()` for post and activity rows.
