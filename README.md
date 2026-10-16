# Retain — Personal Expense & Budget Manager

Retain is a full-stack web app for recording personal expenses, setting a monthly budget and seeing where your money goes. Admins manage the shared expense categories and see platform-wide insights.

| | |
|---|---|
| **Live app** | https://retain-henna.vercel.app |
| **Live API** | https://retain-api-mqmj.onrender.com/api/health |

**Demo accounts** (created by the seed script):

| Role | Email | Password |
|---|---|---|
| User | `demo@retain.app` | `Demo@12345` |
| Admin | `admin@retain.app` | `Admin@12345` _(set via `ADMIN_PASSWORD` in production)_ |

> The API runs on Render's free tier, so the first request after a period of inactivity can take ~30–50 seconds while the server wakes up.

---

## Features

### For users
- **Sign up, sign in, sign out.** Sessions survive page reloads and expire automatically.
- **Expense CRUD.** Each expense has a title, amount, category, date, payment method (cash, card, mobile money, bank transfer, other) and optional notes. Users can create, view, edit and delete their own expenses.
- **Search, filter and sort.**
  - Free-text search across title, notes and category.
  - Filters for category, payment method, date range (with *This month*, *Last month* and *Last 30 days* presets) and amount range.
  - Sort by date, amount or title.
  - Server-side pagination with 5, 10, 20 or 50 rows per page.
- **Monthly budget.** Set or update a budget for any month. For each month you see:
  - total spent and remaining budget
  - a progress bar
  - a status: **Within budget** (under 80%), **Approaching limit** (80–100%) or **Over budget** (over 100%)
  - your budget history for past months
- **Dashboard** for any month:
  - total spending, with the expense count and average
  - remaining budget
  - highest individual expense
  - top category
  - spending by category
  - a daily spending chart
  - recent expenses
- **Responsive UI.** A sidebar on desktop and a slide-out drawer on mobile. Tables become card lists on small screens, and forms open full-screen on phones. Light and dark mode follow the OS setting by default and can be toggled.

### For admins
- **Category management.** Create, rename, recolor and delete expense categories. A category that is still used by expenses can't be deleted, which protects users' data; it can be renamed instead.
- **Platform insights:**
  - total registered users (plus new users this month and the admin count)
  - total number of expenses recorded
  - total value of all expenses recorded
  - number (and value) of expenses recorded during the current month
  - total spending per category
  - top 5 most-used and bottom 5 least-used categories (unused categories count as least used)
  - recently added expenses, with who added them
  - recently registered users

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| UI | Material UI (MUI) v9, Recharts |
| State | React Context (authentication), Redux Toolkit + React Redux (expense search / filter / sort / pagination) |
| Routing | React Router v7 |
| HTTP | Axios |
| Backend | Node.js 20, Express 5 (JavaScript, ES modules) |
| Database | PostgreSQL with Prisma ORM |
| Auth | JWT (`jsonwebtoken`), bcrypt password hashing (`bcryptjs`) |
| Validation & security | Zod, Helmet, CORS allow-list, `express-rate-limit` on auth routes |
| Deployment | Vercel (frontend), Render (API), Neon (PostgreSQL) |

---

## How the requirements map to the code

### Authentication — React Context only
- [`client/src/context/AuthProvider.tsx`](client/src/context/AuthProvider.tsx) holds the signed-in user, the auth status (`loading`, `authenticated` or `unauthenticated`) and the `login`, `register` and `logout` actions.
  - On startup it restores the session by calling `GET /auth/me`.
  - It signs the user out automatically when the API returns `401`.
- [`client/src/hooks/useAuth.ts`](client/src/hooks/useAuth.ts) exposes the context, including the `isAdmin` and `hasRole()` helpers.
- [`client/src/components/routing/ProtectedRoute.tsx`](client/src/components/routing/ProtectedRoute.tsx) guards routes using the context:
  - signed-out users are redirected to `/login` and returned to the page they wanted after signing in
  - `<ProtectedRoute roles={['ADMIN']} />` protects the admin routes; non-admins get a 403 screen
- [`GuestRoute`](client/src/components/routing/GuestRoute.tsx) keeps signed-in users away from the sign-in and sign-up pages.

### Searching, filtering and sorting — Redux only
- [`client/src/store/expenseFiltersSlice.ts`](client/src/store/expenseFiltersSlice.ts) holds the search text, every filter, the sort field and order, the page and the page size.
  - Changing any filter resets to page 1.
  - Memoised selectors turn the state into clean API query parameters and count the active filters.
- [`ExpenseFilters`](client/src/components/expenses/ExpenseFilters.tsx) and [`ExpenseList`](client/src/components/expenses/ExpenseList.tsx) dispatch actions. [`useExpenses`](client/src/hooks/useExpenses.ts) reads the selector and fetches the matching page, debouncing the search text.
- Filters are cleared on sign-out, so the next user on the same device doesn't inherit them.

### TypeScript
- All API shapes are typed in [`client/src/types/index.ts`](client/src/types/index.ts): users, expenses, budgets, dashboard data and admin insights.
- The API modules in [`client/src/api/`](client/src/api) return typed data.
- Redux uses typed hooks (`useAppDispatch`, `useAppSelector`).
- No `any` is used in the client.

### Backend authorization
- Every expense and budget query is scoped to `req.user.id`. Another user's expense returns **404**, so the API doesn't even reveal that it exists.
- `requireRole('ADMIN')` protects category create, update and delete and all `/api/admin/*` routes.
- Public sign-up always creates a `USER`. Admin accounts come from the seed script only.
- The user is re-loaded from the database on every request, so deleted accounts and role changes take effect immediately.

---

## Project structure

```
.
├── client/                    React + TypeScript frontend (Vite)
│   └── src/
│       ├── api/               Axios instance + typed API modules
│       ├── components/
│       │   ├── admin/         Category form dialog
│       │   ├── budget/        Budget progress card, form, status chip
│       │   ├── charts/        Category breakdown, daily spending chart
│       │   ├── common/        Shared UI (page header, stat card, dialogs, states…)
│       │   ├── expenses/      Expense filters, list, form, recent list
│       │   ├── layout/        App shell and auth layout
│       │   └── routing/       ProtectedRoute, GuestRoute
│       ├── context/           Auth and notification contexts + providers
│       ├── hooks/             useAuth, useExpenses, useApiQuery, resource hooks…
│       ├── pages/             Route-level pages (admin/ for admin pages)
│       ├── store/             Redux store + expense filters slice
│       ├── types/             Shared TypeScript types
│       └── utils/             Formatting and month helpers
├── server/                    Express REST API (JavaScript)
│   ├── prisma/                Schema, migrations, seed script
│   └── src/
│       ├── controllers/       Route handlers
│       ├── lib/               Prisma client, env, errors, serializers, dates
│       ├── middleware/        Auth, role guard, validation, error handler
│       ├── routes/            Express routers
│       └── validators/        Zod request schemas
├── docker-compose.yml         Local PostgreSQL
└── render.yaml                Render deployment blueprint
```

---

## Running locally

**Prerequisites:** Node.js 20+, npm, and Docker (or any PostgreSQL 14+ instance).

```bash
# 1. Start PostgreSQL (listens on localhost:5436)
docker compose up -d

# 2. API
cd server
cp .env.example .env          # then set JWT_SECRET to a long random string
npm install
npx prisma migrate dev        # creates the tables
npm run db:seed               # admin, default categories, demo user + sample data
npm run dev                   # http://localhost:4000

# 3. Frontend (in a second terminal)
cd client
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

In development, Vite proxies `/api` to `http://localhost:4000`, so no CORS setup is needed.

### Environment variables

**`server/.env`**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs. Use a long random value |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `PORT` | API port (default `4000`) |
| `CLIENT_ORIGIN` | Comma-separated list of frontend origins allowed by CORS |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created by the seed script |
| `SEED_DEMO_DATA` | `true` to also seed the demo user with four months of sample expenses |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL. `/api` locally; `https://retain-api-mqmj.onrender.com/api` in production |
| `VITE_CURRENCY` | ISO currency code used to format amounts (default `USD`) |

### Useful scripts

| Where | Command | What it does |
|---|---|---|
| server | `npm run dev` | API with auto-reload |
| server | `npm run db:seed` | Seed admin, categories and demo data. Safe to re-run |
| server | `npm run db:studio` | Browse the database in Prisma Studio |
| server | `npm run db:reset` | **Drops all data**, re-applies migrations and re-seeds |
| client | `npm run dev` | Vite dev server |
| client | `npm run build` | Type-check and build for production |
| client | `npm run lint` | Lint with oxlint |
| both | `npm run format` | Format with Prettier |

---

## API reference

Base URL: `/api`. Except for `register`, `login` and `health`, every endpoint requires `Authorization: Bearer <token>`.

Responses are JSON. Errors have the form `{ "message": string, "errors"?: [{ "field", "message" }] }` and use these status codes:

| Status | Meaning |
|---|---|
| `400` | Validation failed |
| `401` | Not signed in, or the session expired |
| `403` | Signed in, but not an admin |
| `404` | Not found, or not yours |
| `409` | Conflict (duplicate email or category name, or the category is in use) |
| `429` | Too many sign-in or sign-up attempts |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Body `{ name, email, password }`. The password needs at least 8 characters, with a letter and a number. Returns `{ token, user }` |
| `POST` | `/auth/login` | Body `{ email, password }`. Returns `{ token, user }` |
| `GET` | `/auth/me` | The current user |

### Expenses (owner only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/expenses` | Paginated, filtered and sorted list of your expenses (query parameters below) |
| `POST` | `/expenses` | Body `{ title, amount, categoryId, date: "YYYY-MM-DD", paymentMethod, notes? }` |
| `GET` | `/expenses/:id` | One expense |
| `PUT` | `/expenses/:id` | Update any subset of the fields |
| `DELETE` | `/expenses/:id` | Delete. Returns `204` |

Query parameters for `GET /expenses`:

| Parameter | Values |
|---|---|
| `search` | Matches title, notes or category name, case-insensitive |
| `categoryId` | Category UUID |
| `paymentMethod` | `CASH`, `CARD`, `MOBILE_MONEY`, `BANK_TRANSFER` or `OTHER` |
| `startDate`, `endDate` | `YYYY-MM-DD` (inclusive) |
| `minAmount`, `maxAmount` | Numbers |
| `sortBy` | `date` (default), `amount`, `title` or `createdAt` |
| `order` | `desc` (default) or `asc` |
| `page` | Default `1` |
| `limit` | Default `10`, max `100` |

Example response:

```json
{
  "data": [{ "id": "…", "title": "Groceries", "amount": 24.08, "date": "2026-10-06",
             "paymentMethod": "CARD", "notes": null, "categoryId": "…",
             "category": { "id": "…", "name": "Food & Dining", "color": "#f97316" } }],
  "pagination": { "page": 1, "limit": 10, "total": 57, "totalPages": 6 },
  "summary": { "totalAmount": 3120.55 }
}
```

### Budgets (owner only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/budgets` | Your last 12 budgets, each with spent, remaining and status |
| `GET` | `/budgets/:month` | Summary for `YYYY-MM`: `{ budget, totalSpent, remaining, percentUsed, status }` |
| `PUT` | `/budgets/:month` | Body `{ amount }`. Creates or updates the budget for that month |
| `DELETE` | `/budgets/:month` | Remove the budget for that month |

`status` is one of `none`, `within`, `approaching` (at least 80% used) or `over` (more than 100% used).

### Dashboard (owner only)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard?month=YYYY-MM` | See the field list below. `month` defaults to the current month |

The response contains:
- `totalSpent`, `expenseCount` and `averageExpense`
- the `budget` summary
- `highestExpense`
- `spendingByCategory`, with totals, counts and percentages
- `dailySpending`
- `recentExpenses`

### Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/categories` | Any signed-in user | List categories. Admins also get `expenseCount` |
| `POST` | `/categories` | Admin | Body `{ name, color? }`. Names are unique, case-insensitive |
| `PUT` | `/categories/:id` | Admin | Rename or recolor |
| `DELETE` | `/categories/:id` | Admin | Delete. Returns `409` if any expense uses the category |

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/admin/insights` | Admin | Totals (users, expenses, value, this month), spending per category, top and bottom 5 categories by usage, recent expenses, recent users |

"Expenses recorded during the current month" counts expenses **created** in the current calendar month, regardless of the expense date the user entered.

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | `{ status: "ok" }`. Used by Render's health check |

---

## Data model

```
User      id, name, email (unique), passwordHash, role (USER | ADMIN), createdAt
Category  id, name (unique), color, createdAt
Expense   id, title, amount (decimal 12,2), date, paymentMethod, notes?, userId → User, categoryId → Category
Budget    id, userId → User, month ("YYYY-MM"), amount (decimal 12,2), unique(userId, month)
```

Deleting a user cascades to their expenses and budgets. Deleting a category that is still in use is blocked.

---

## Deployment

1. **Database (Neon).** Create a project and copy the connection string, including `?sslmode=require`. Use the direct (non-pooled) host so Prisma migrations work.
2. **API (Render).** Choose *New → Blueprint* and select this repository. Render reads [`render.yaml`](render.yaml). Fill in `DATABASE_URL`, `CLIENT_ORIGIN` (your Vercel URL), `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The build runs migrations and the seed script, which is idempotent.
3. **Frontend (Vercel).** Import the repository and set the following:
   - **Root Directory:** `client`
   - **Framework:** Vite
   - **Environment variable:** `VITE_API_URL=https://retain-api-mqmj.onrender.com/api`

   [`client/vercel.json`](client/vercel.json) rewrites all routes to `index.html`, so deep links like `/expenses/123` work.
4. Put both live URLs at the top of this README.
