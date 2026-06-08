# ME2U Frontend

Prototype UI wired to the Node API.

## Run

1. Database + API (from repo root):

```bash
cd Backend
npm run db:setup    # Docker Postgres + migrate + seed (first time)
npm run dev         # http://localhost:3001
```

2. Open the UI — use a local server (required for `fetch`):

```bash
cd "Front end"
npx --yes serve -p 5500
```

Open http://localhost:5500/me2u.html

## Dev roles

Use the **Buyer / Seller / Admin** switcher. Each role calls the API as a different seeded user (Chanda, TechZone, Admin).

Override API URL: `localStorage.setItem('me2u-api-base', 'http://localhost:3001')`
