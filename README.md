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

In plain static preview mode, the document app uses browser `sessionStorage`.

### Windows Double-Click Start

Double-click:

```text
start-windows.cmd
```

It opens:

```text
http://localhost:8788/app/
```

No Node.js install is needed on Windows. The launcher uses Windows PowerShell, which is included with Windows.

By default it loads:

```text
data\static-data.json
```

Edit that file when you want to change the always-loaded local data. You can also drag a different `.json` file onto `start-windows.cmd` for a one-off run. The command window must stay open while you use the app. Close it, or press `Ctrl+C`, to stop the local server.

Static preview with a JSON file imported on first load:

```bash
npm run start -- --data ./examples/uvoz-data.json
```

Open:

```text
http://localhost:8788/app/
```

The `--data` flag serves the provided file as `/app/static-data.json`. The app imports that JSON when the current browser session has no saved data. Click `Osvježi` to reload the static JSON during the same session.

You can also point the app at any served JSON file with the `uvoz` query parameter:

```text
http://localhost:8788/app/?uvoz=/app/static-data.json
http://localhost:8788/app/?uvoz=/my-data.json
```

Expected JSON shape:

```json
{
  "employers": [
    {
      "company_name": "AMZ Gradnja d.o.o.",
      "street": "Kolodvrska 37",
      "city": "Stari Perkovci - Vrpolje",
      "postal": "35214",
      "vat": "72018608521",
      "director": "Josip Josipovic"
    }
  ],
  "accounting": [],
  "employees": [
    {
      "name": "Amel",
      "lastname": "Dedic",
      "street": "Alije Hadzica 3",
      "city": "Kalesija - BiH",
      "postal": "75265",
      "personal_id": "B1265547",
      "employer_names": ["AMZ Gradnja d.o.o."]
    }
  ]
}
```

## Build Static Output

Build the static site to `dist/`:

```bash
npm run build
```

Build and include a static JSON import file:

```bash
npm run build -- --data ./examples/uvoz-data.json
npm run preview
```

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

Generated documents can be opened for print/PDF or downloaded as standalone print-ready HTML files with the app logo embedded.
