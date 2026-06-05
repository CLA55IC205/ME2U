# ME2U Backend API

Node.js + TypeScript + Express + Prisma + PostgreSQL.

Implements the escrow workflow from the frontend prototype: order creation, payment hold, dispatch, buyer confirmation, disputes, admin escrow view, and auto-release.

## Stack choice

| Layer | Choice | Why |
|--------|--------|-----|
| API | **Node.js + Express** | Fast to scaffold, pairs well with a future React frontend, strong JSON/HTTP ecosystem |
| ORM | **Prisma** | Schema-first PostgreSQL, migrations, type-safe queries |
| DB | **PostgreSQL** | As planned |

React is for the UI later; this folder is API-only.

## Quick start

### 1. Start PostgreSQL

```bash
cd Backend
docker-compose up -d
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Install and migrate

```bash
npm install
npm run db:push
npm run db:seed
```

### 4. Run API

```bash
npm run dev
```

API base: `http://localhost:3001`

## Dev authentication

Until JWT is added, send the seeded user's UUID:

```http
X-User-Id: <uuid-from-/api/dev/users>
```

List users:

```http
GET /api/dev/users
```

## API overview

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/api/dev/users` | — | Dev user list |
| GET | `/api/orders` | buyer/seller/admin | List orders for current user |
| GET | `/api/orders/:publicId` | * | Order detail |
| POST | `/api/orders` | buyer | Create order (payment pending) |
| POST | `/api/orders/:id/confirm-payment` | buyer | Simulate escrow payment received |
| PATCH | `/api/orders/:id/dispatch` | seller | Mark dispatched |
| POST | `/api/orders/:id/arrival` | seller | Mark arrival (starts 24h auto-release) |
| POST | `/api/orders/:id/confirm-receipt` | buyer | Release funds to seller |
| POST | `/api/orders/:id/disputes` | buyer | Open dispute |
| GET | `/api/tracking/:number` | — | Track by courier number |
| GET | `/api/admin/escrow` | admin | Escrow float summary |
| GET | `/api/admin/orders` | admin | All orders |
| GET | `/api/admin/disputes` | admin | Open disputes |
| POST | `/api/admin/disputes/:id/resolve` | admin | Body: `{ "resolution": "seller" \| "buyer" \| "split" }` |
| GET | `/api/admin/auto-releases` | admin | Pending auto-releases |
| POST | `/api/admin/auto-releases/run` | admin | Process due releases |
| POST | `/api/admin/orders/:id/release` | admin | Force release |
| GET | `/api/admin/users` | admin | User summary |

Order JSON shape matches the frontend `ORDERS` mock (`id`, `buyer`, `seller`, `status`, `autoReleaseHours`, etc.).

## Example flow

```bash
# Chanda (buyer) — get ID from /api/dev/users
export USER_ID="<chanda-uuid>"

# Create order
curl -s -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{
    "sellerPhone": "0955330221",
    "sellerName": "TechZone Lusaka",
    "itemDescription": "USB-C Hub",
    "amountZmw": 210,
    "destination": "Woodlands",
    "origin": "Lusaka CBD",
    "paymentProvider": "airtel"
  }'

# Confirm payment (dev simulation)
curl -s -X POST http://localhost:3001/api/orders/ME2U-0042/confirm-payment \
  -H "X-User-Id: $USER_ID"
```

## Auto-release

Set `AUTO_RELEASE_HOURS=24` in `.env`. Timer starts when the seller calls `POST .../arrival`. Run releases manually via admin endpoint or add a cron/worker later.

## Next steps

- [ ] Wire `Front end/script.js` to these endpoints
- [ ] MTN / Airtel Money webhooks instead of `confirm-payment`
- [ ] JWT auth (replace `X-User-Id`)
- [ ] Driver confirm tokens (`DriverConfirmToken` model)
- [ ] Scheduled job for `runAutoReleases`
