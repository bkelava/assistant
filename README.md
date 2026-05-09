# Dokumenti za Cloudflare

This repository contains the Cloudflare-compatible web application for preparing Croatian employment documents.

The deployable app lives in:

- `public/` - browser UI, forms, local fallback storage, document/print views
- `functions/api/` - Cloudflare Pages Function API
- `migrations/` - Cloudflare D1 schema and seed data
- `wrangler.toml` - Cloudflare configuration

## Features

- Manage employers.
- Manage employees.
- Link employees to employers.
- Generate printable document views for:
  - ugovor o radu na neodredeno vrijeme
  - ugovor o radu na odredeno vrijeme
  - aneks ugovora o radu za A1
  - evidencija radnog vremena
  - GFI odluka/izvjestaj
- Save/print generated documents as PDF from the browser print dialog.
- Use Cloudflare D1 when deployed.
- Fall back to browser `localStorage` when opened as a plain static site.

## Try Locally

The static UI can run without installing dependencies:

```bash
python3 -m http.server 8788 --directory public
```

Open:

```text
http://localhost:8788/
```

In this mode the app uses browser storage because the Cloudflare API is not running.

## Run With Cloudflare Pages Functions

Install dependencies:

```bash
npm install
```

Create the D1 database:

```bash
npm run db:create
```

Copy the generated database id into `wrangler.toml`, replacing:

```text
replace-after-running-wrangler-d1-create
```

Apply migrations locally:

```bash
npm run db:migrate
```

Start the Cloudflare local dev server:

```bash
npm run dev
```

## Deploy

Apply the D1 migration to the remote database:

```bash
npm run db:migrate:remote
```

Deploy the Pages app:

```bash
npm run deploy
```

After deployment, connect your custom domain in Cloudflare Pages.

## Notes

Documents are generated as printable browser pages and can be saved as PDF through the browser print dialog. This keeps the app dependency-light and compatible with Cloudflare's free Pages/Workers/D1 stack.
