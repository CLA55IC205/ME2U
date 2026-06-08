# ME2U — Full Setup Guide (Ubuntu)

This guide takes you from a fresh clone to a fully running local stack:
Postgres → API → Frontend, all on your PC.

---

## What you need

- Ubuntu 20.04 or later (or WSL2 on Windows)
- Node.js 18 or later
- A terminal

Check Node version:
```bash
node --version   # should print v18.x or higher
```

Install Node if needed:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Step 1 — Project layout

After copying all files your project should look like this:

```
ME2U/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma      ← database table definitions
│   │   └── seed.ts            ← sample data for development
│   ├── scripts/
│   │   └── setup-db.sh        ← one-command database setup
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts
│   │   ├── lib/
│   │   │   ├── errors.ts
│   │   │   ├── orderMapper.ts
│   │   │   ├── params.ts
│   │   │   └── prisma.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── admin.ts
│   │   │   ├── dev.ts
│   │   │   ├── health.ts
│   │   │   ├── orders.ts
│   │   │   └── tracking.ts
│   │   ├── services/
│   │   │   ├── adminService.ts
│   │   │   └── orderService.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env                   ← created by setup-db.sh
│   ├── package.json
│   └── tsconfig.json
│
└── Front end/
    ├── me2u.html
    ├── styles.css
    ├── script.js
    └── api.js
```

---

## Step 2 — Start the database

The setup script handles everything: installs Docker if needed, creates a
Postgres container, writes your `.env`, runs migrations, and seeds data.

```bash
cd Backend
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

This takes about 1–2 minutes the first time.

> **If you don't have Docker yet**, the script will install it automatically.
> After installation you may need to run `newgrp docker` (or log out/in)
> then run the script again.

---

## Step 3 — Start the API

```bash
cd Backend
npm run dev
```

You should see:
```
ME2U API listening on http://localhost:3001
  Health:  GET /health
  Dev users: GET /api/dev/users
```

Test it: http://localhost:3001/health  → `{"status":"ok","service":"me2u-api"}`

---

## Step 4 — Open the frontend

In a new terminal tab:

```bash
cd "Front end"
npx --yes serve -p 5500
```

Open: **http://localhost:5500/me2u.html**

Use the **Buyer / Seller / Admin** switcher — each view uses a different
seeded user from the database.

---

## Day-to-day commands

| Task | Command |
|------|---------|
| Start API | `cd Backend && npm run dev` |
| Start DB (after reboot) | `docker start me2u-db` |
| Stop DB | `docker stop me2u-db` |
| Reset & re-seed data | `cd Backend && npm run db:reset` |
| Re-seed without reset | `cd Backend && npm run db:seed` |
| Visual DB browser | `cd Backend && npm run db:studio` |
| Add a new DB column | Edit `prisma/schema.prisma`, then `npm run db:migrate` |

---

## Seeded data

The seed creates five orders in different lifecycle stages:

| Order | Item | Status |
|-------|------|--------|
| ME2U-0001 | Wireless Earbuds | In transit (tracking: ZAM-2947831) |
| ME2U-0002 | Laptop Stand | Awaiting dispatch |
| ME2U-0003 | USB-C Hub | Delivered ✓ |
| ME2U-0004 | Mechanical Keyboard | Dispute open ⚠ |
| ME2U-0005 | Smartphone Case | Payment pending |

Dev users:
- **Buyer** — Chanda Mutale (phone: 260971000001)
- **Seller** — TechZone Lusaka (phone: 260955000002)
- **Admin** — ME2U Admin (phone: 260900000099)

---

## Troubleshooting

**"Docker daemon not running"**
```bash
sudo systemctl start docker
```

**"Port 5432 already in use"**
Another Postgres may be running. Stop it or change `DB_PORT` in
`setup-db.sh` and `DATABASE_URL` in `.env`.

**"Missing X-User-Id header"**
The API can't find the Bootstrap users. Make sure the seed ran:
```bash
cd Backend && npm run db:seed
```

**Frontend shows "Could not reach the API"**
Make sure `npm run dev` is running in the Backend folder, then refresh.

**API URL override**  
If you run the API on a different port:
```js
// In browser console:
localStorage.setItem('me2u-api-base', 'http://localhost:3002')
```

---

## Database details

| Setting | Value |
|---------|-------|
| Host | localhost |
| Port | 5432 |
| Database | me2u |
| User | me2u_user |
| Password | me2u_secret |
| Container | me2u-db |

These are development defaults — change them before going to production.
