# Shadman Portfolio

A modern portfolio highlighting **[Zarish Charity](https://zarishcharity.org/)**, plus photo and script uploads powered by **[Supabase Storage](https://github.com/supabase/storage)**.

**Live site:** https://shadman2598.github.io/Shadman-Portfolio/

## Preview locally

```bash
cd ~/shadman-portfolio
python3 -m http.server 8765
```

Open [http://localhost:8765](http://localhost:8765)

## What's on the site

1. **About me** — personal intro
2. **Zarish Charity** — mission, goals, and link to zarishcharity.org
3. **Photos** — upload gallery (Supabase Storage)
4. **Scripts** — upload + preview code files (Supabase Storage)
5. **Contact** — email and GitHub

## Enable Supabase Storage

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **Project Settings → API** and copy:
   - Project URL
   - `anon` `public` key
3. Paste them into `js/supabase-config.js`
4. In Supabase **SQL Editor**, run `supabase/setup.sql`
   - Creates public `photos` and `scripts` buckets
   - Adds read / upload / delete policies
5. Refresh the portfolio and upload files — they sync to the cloud and show on GitHub Pages

Until keys are added, uploads fall back to this browser only (localStorage).

## Customize content

Edit **`js/content.js`** for name, bio, charity copy, and contact links.

## Deploy

Pushes to `main` deploy automatically via GitHub Actions → GitHub Pages.
