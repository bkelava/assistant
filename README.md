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

Generated documents are rendered server-side (via Cloudflare Browser Rendering, see `functions/api/pdf.js`) and downloaded as ready-to-file PDFs with the app logo embedded. This requires the `BROWSER` binding declared in `wrangler.toml` — it is only available once deployed (`npm run deploy`), since Browser Rendering is not emulated by `wrangler pages dev`.
