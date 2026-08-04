# Bakeaway

Home bakery price calculator and pre-order manager built with React, Vite, Tailwind CSS, and Supabase.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example`, then fill in your Supabase values:

   ```bash
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

## Supabase

The database schema is in `supabase-schema.sql`. It creates:

- `batches`
- `orders`

For the connected Supabase project `Bakeaway`, the tables have already been created and Row Level Security is enabled. Add narrowly scoped policies or authentication before using the database from a public deployment.

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` builds the production bundle.
- `npm run lint` runs TypeScript checks.
