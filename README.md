# Kokelava Website + Dokumenti

Cloudflare Pages project with two local routes:

- `/` - responsive public website for Knjigovodstveni obrt Kelava
- `/app/` - document-generation application for employers, employees, contracts, A1 annexes, ERV, and GFI

## Project Layout

- `public/index.html` - public accounting-company website
- `public/assets/img/` - website images copied from the live site
- `public/app/` - document application
- `functions/api/` - Cloudflare Pages Function API
- `migrations/` - Cloudflare D1 schema and seed data
- `wrangler.toml` - Cloudflare Pages and D1 configuration

## Local Preview

Static preview:

```bash
python3 -m http.server 8788 --directory public
```

Open:

```text
http://localhost:8788/
http://localhost:8788/app/
```

In plain static preview mode, the document app uses browser `localStorage` if the Cloudflare API is not available.

## Cloudflare Pages

Install dependencies:

```bash
npm install
```

Create the D1 database:

```bash
npm run db:create
```

Copy the generated database id into `wrangler.toml`, then apply migrations:

```bash
npm run db:migrate
```

Start Cloudflare local development:

```bash
npm run dev
```

## Deploy

```bash
npm run db:migrate:remote
npm run deploy
```

Generated documents are rendered client-side as standalone HTML files (see `public/app/print.js`) with the app logo embedded, and downloaded directly as `.html`. Opening the downloaded file shows an "Ispiši / spremi PDF" button that uses the browser's native print dialog to save it as PDF. No server or Cloudflare binding is required, so this works identically under `npm run dev` and once deployed.
