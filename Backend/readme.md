# 📦 ME2U Backend API


##  Tech Stack
- Node.js / Django (backend)
- PostgreSQL / MySQL
- JWT authentication
- Cron jobs (auto-release system)

---

## Project Structure
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── app.js
├── database/
├── tests/
└── README.md

---

## Database Models

### User
- id
- name
- phone
- role

### Order
- id
- buyer_id
- seller_id
- status
- amount

### Payment
- id
- order_id
- status (held/released/refunded)

### Delivery
- id
- order_id
- status

### Dispute
- id
- order_id
- status

---

##  API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Orders
- POST /api/orders
- GET /api/orders/:id

### Delivery
- POST /api/delivery/confirm
- POST /api/delivery/dispute

### Payment
- POST /api/payment/hold
- POST /api/payment/release

### Admin
- GET /api/admin/orders
- POST /api/admin/override

---

## ⏱️ Auto-Release System
- Runs every few minutes/hour
- Checks delivered orders
- If 24 hours pass without dispute → release funds

---

##  Dispute System
- Buyer can raise dispute
- Order gets frozen
- Admin resolves:
  - Refund buyer
  - Pay seller
  - Investigate

---

##  Environment Variables
PORT=5000
DATABASE_URL=your_url
JWT_SECRET=your_secret
ESCROW_TIMEOUT=24h

---

##  Run Project
npm install
npm run dev