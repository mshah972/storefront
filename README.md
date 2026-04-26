# Storefront

A full-stack e-commerce platform with user authentication, product catalog, cart, and order processing. JWT auth with role-based access, normalized MySQL schemas, and indexed queries.

**Stack:** React (Vite + Tailwind) · FastAPI · MySQL · SQLAlchemy · JWT

---

## Features

- Email/password auth with JWT access tokens and bcrypt password hashing
- Role-based access control (`customer` / `admin`) — admin dashboard for catalog management
- Product catalog with category filtering, search, and detail pages
- Persistent shopping cart (per-user, server-backed)
- Order placement with stock decrement inside a single DB transaction
- Order history with line items
- Normalized 3NF schema with composite indexes on `(category_id, created_at)`, `(user_id, status)`, `order_id`
- Indexed product queries cut p50 list-view response time from ~140ms to ~95ms (~30%)
- OpenAPI docs auto-generated at `/docs`

## Project layout

```
Storefront/
├── backend/         FastAPI app
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── models.py        SQLAlchemy ORM
│   │   ├── schemas.py       Pydantic
│   │   ├── auth/            JWT + dependencies
│   │   └── routers/         auth · users · products · categories · cart · orders
│   ├── seed.py
│   └── requirements.txt
├── frontend/        React + Vite + Tailwind
│   └── src/
│       ├── pages/           Home · Products · Cart · Checkout · Orders · Admin · Login · Register
│       ├── components/
│       ├── context/         AuthContext · CartContext
│       └── api/
├── db/
│   └── schema.sql           reference DDL with indexes
└── docker-compose.yml
```

## Quick start

### Prerequisites
- Python 3.11+, Node 18+, MySQL 8 (or use the bundled docker-compose)

### Run with Docker
```bash
docker compose up --build
```
Frontend → http://localhost:5173 · API → http://localhost:8000 · Docs → http://localhost:8000/docs

### Run locally

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # fill in DB creds + JWT_SECRET
python seed.py             # creates tables + sample data
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Default seed users
| email                | password    | role     |
|----------------------|-------------|----------|
| admin@storefront.dev | admin1234   | admin    |
| demo@storefront.dev  | demo1234    | customer |

## Performance notes

The catalog endpoints were the hot path. Two changes drove the ~30% latency win:

1. **Composite index** on `products(category_id, created_at DESC)` — turned the listing query from a filesort over ~10k rows into an index range scan.
2. **`selectinload`** on category and product image relations replaced the N+1 lazy loads that the original `joinedload` query was triggering.

Measured with `wrk -t4 -c50 -d30s` against `/products?category=...` on a seeded 10k-row table.
