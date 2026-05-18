# Lifelapss Web

Lifelapss Web is a Vite + React frontend for a creator platform with courses, media discovery, blog content, donations, social proof, and an admin panel.

## Stack

- React 18
- Vite 5
- Tailwind CSS
- Radix UI
- Supabase
- PayPal
- Razorpay
- Cloudinary

## Main Features

- public homepage, about page, help page, blog, gallery, and videos
- course catalog, course detail flow, and enrollment checkout
- user auth, favorites, my library, and enrolled courses
- admin pages for users, articles, images, videos, products, sales, and media uploads
- social sections with optional live YouTube / Instagram / Facebook stats
- donation flow and donor wall

## Local Setup

Requirements:

- Node.js 18+
- npm

Run locally:

```bash
npm install
cp .env.example .env
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Environment Variables

Frontend variables:

- `VITE_PAYPAL_CLIENT_ID`
- `VITE_RAZORPAY_KEY_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_CLOUDINARY_FOLDER`
- `VITE_SOCIAL_STATS_FUNCTION_NAME`

Backend / Edge Function variables:

- `YOUTUBE_API_KEY`
- `YOUTUBE_CHANNEL_ID`
- `YOUTUBE_CHANNEL_HANDLE`
- `META_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ID`
- `INSTAGRAM_USER_ID`
- `INSTAGRAM_USERNAME`
- `INSTAGRAM_PUBLIC_APP_ID`

Use [`.env.example`](.env.example) as the starter template. Keep real secrets in local env files or in Supabase project secrets, not in Git.

## Supabase Notes

The app currently connects to Supabase through [`src/lib/customSupabaseClient.js`](src/lib/customSupabaseClient.js).

Included function:

- [`supabase/functions/social-stats/index.ts`](supabase/functions/social-stats/index.ts)

Referenced by the frontend but not included in this repo:

- `create-razorpay-order`
- `generate-article`

If you use the live social sections, also review:

- [`supabase/functions/social-stats/README.md`](supabase/functions/social-stats/README.md)

## Security

Before production use:

- apply [`supabase/rls_lockdown.sql`](supabase/rls_lockdown.sql) in Supabase
- if Security Advisor still flags `courses`, `media_library`, or `promo_codes`, apply [`supabase/rls_remaining_public_tables.sql`](supabase/rls_remaining_public_tables.sql)
- keep `.env`, `.env.*`, and service credentials out of Git
- add server-side payment verification before treating payment success as trusted

## Project Structure

```text
src/
  components/
  contexts/
  data/
  hooks/
  lib/
  pages/
  services/
  utils/
supabase/
  functions/
  rls_lockdown.sql
  rls_remaining_public_tables.sql
tools/
plugins/
```

## Repository

GitHub:

```text
https://github.com/Vipul4765/lifelapss-web
```
