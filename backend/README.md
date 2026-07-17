# Climate Cardinals KNUST — Backend API

A REST API for the Climate Cardinals KNUST website: merch shop (products, cart,
checkout), events & registrations, and engagement features (newsletter, contact,
donations, volunteer applications, editable team & impact content).

Built with **Node.js + Express**, **PostgreSQL**, and **Prisma**, with JWT
authentication and Zod request validation.

---

## Tech stack

| Concern         | Choice                          |
| --------------- | ------------------------------- |
| Runtime         | Node.js (18+)                   |
| Web framework   | Express 4                       |
| Database        | PostgreSQL                      |
| ORM             | Prisma 5                        |
| Auth            | JWT (`jsonwebtoken`) + bcryptjs |
| Validation      | Zod                             |
| Security        | helmet, cors, express-rate-limit |
| Logging         | morgan                          |

---

## Project structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database models
│   ├── migrations/            # Generated SQL migrations
│   └── seed.js                # Seeds products/events/team/impact + admin user
├── src/
│   ├── config/
│   │   └── env.js             # Loads & validates environment variables
│   ├── lib/
│   │   └── prisma.js          # Singleton Prisma client
│   ├── middleware/
│   │   ├── auth.js            # authenticate / optionalAuth / authorize(role)
│   │   ├── validate.js        # Zod validation middleware
│   │   ├── rateLimiter.js     # API + auth rate limiters
│   │   ├── notFound.js        # 404 handler
│   │   └── errorHandler.js    # Central error handler (maps Prisma errors)
│   ├── utils/
│   │   ├── ApiError.js        # HTTP-aware error class
│   │   ├── asyncHandler.js    # Async error forwarding
│   │   ├── password.js        # bcrypt hash/verify
│   │   ├── jwt.js             # sign/verify tokens
│   │   ├── slugify.js         # URL slugs
│   │   ├── totals.js          # Cart/order money math (shipping, tax)
│   │   └── pagination.js      # Pagination helpers
│   ├── validators/            # Zod schemas per resource
│   ├── controllers/           # Request handlers per resource
│   ├── routes/                # Express routers per resource
│   │   └── index.js           # Mounts all resource routers under /api
│   ├── app.js                 # Express app assembly (middleware pipeline)
│   └── server.js              # HTTP server + graceful shutdown
├── .env.example
└── package.json
```

The layering is **route → validate → (auth) → controller → Prisma**, so each
concern lives in exactly one place.

---

## Getting started

### 1. Prerequisites
- Node.js 18+
- A running PostgreSQL instance

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# then edit .env — set DATABASE_URL and a strong JWT_SECRET
```

Key variables (see `.env.example` for the full list):

| Variable         | Description                                        |
| ---------------- | -------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string                       |
| `JWT_SECRET`     | Secret for signing tokens (≥16 chars)              |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`)                         |
| `CORS_ORIGINS`   | Comma-separated allowed frontend origins, or `*`   |
| `PORT`           | HTTP port (default `4000`)                          |
| `SEED_ADMIN_*`   | Bootstrap admin credentials used by the seed script |

### 4. Set up the database
```bash
npm run prisma:migrate     # create tables from the schema
npm run db:seed            # load products/events/team/impact + admin user
```

### 5. Run
```bash
npm run dev      # watch mode
# or
npm start
```

The API is now at `http://localhost:4000`. Health check: `GET /health`.

---

## Authentication

- Register or log in to receive a **JWT**. It is returned in the JSON body and
  also set as an `httpOnly` cookie named `token`.
- Send it on protected requests via either:
  - `Authorization: Bearer <token>` header, or
  - the `token` cookie (sent automatically by browsers).
- Roles: `USER` (default) and `ADMIN`. Admin-only routes are marked below.

---

## API reference

Base path: `/api`

### Auth — `/auth`
| Method | Path        | Auth | Description                     |
| ------ | ----------- | ---- | ------------------------------- |
| POST   | `/register` | –    | Create account, returns token   |
| POST   | `/login`    | –    | Log in, returns token           |
| POST   | `/logout`   | –    | Clear the auth cookie           |
| GET    | `/me`       | User | Current authenticated user      |

### Products — `/products`
| Method | Path          | Auth  | Description                                   |
| ------ | ------------- | ----- | -------------------------------------------- |
| GET    | `/`           | –     | List (query: `category`, `search`, `page`, `limit`) |
| GET    | `/:idOrSlug`  | –     | Single product                               |
| POST   | `/`           | Admin | Create product                               |
| PATCH  | `/:idOrSlug`  | Admin | Update product                               |
| DELETE | `/:idOrSlug`  | Admin | Delete product                               |

### Cart — `/cart` (all require auth)
| Method | Path                 | Description                       |
| ------ | -------------------- | -------------------------------- |
| GET    | `/`                  | Get cart with totals             |
| POST   | `/items`             | Add item `{ productId, quantity }` |
| PATCH  | `/items/:productId`  | Set quantity (0 removes)         |
| DELETE | `/items/:productId`  | Remove item                      |
| DELETE | `/`                  | Clear cart                       |

### Orders — `/orders`
| Method | Path           | Auth   | Description                                        |
| ------ | -------------- | ------ | ------------------------------------------------- |
| POST   | `/`            | Guest/User | Place order. Uses body `items` or the user's cart. Prices & totals are computed server-side. |
| GET    | `/`            | User   | Own orders (Admins: `?scope=all`)                 |
| GET    | `/:id`         | User   | Single order (owner or admin)                     |
| PATCH  | `/:id/status`  | Admin  | Update status (`PENDING`/`PAID`/`FULFILLED`/`CANCELLED`) |

### Events — `/events`
| Method | Path                       | Auth       | Description                                  |
| ------ | -------------------------- | ---------- | -------------------------------------------- |
| GET    | `/`                        | –          | List (query: `category`, `upcoming`, paging) |
| GET    | `/:idOrSlug`               | –          | Single event                                 |
| POST   | `/:idOrSlug/register`      | Guest/User | Register `{ name, email, phone? }`           |
| GET    | `/:idOrSlug/registrations` | Admin      | List registrations                           |
| POST   | `/`                        | Admin      | Create event                                 |
| PATCH  | `/:idOrSlug`               | Admin      | Update event                                 |
| DELETE | `/:idOrSlug`               | Admin      | Delete event                                 |

### Newsletter — `/newsletter`
| Method | Path           | Auth  | Description               |
| ------ | -------------- | ----- | ------------------------- |
| POST   | `/subscribe`   | –     | Subscribe `{ email }`     |
| POST   | `/unsubscribe` | –     | Unsubscribe `{ email }`   |
| GET    | `/subscribers` | Admin | List active subscribers   |

### Team — `/team`
| Method | Path    | Auth  | Description                          |
| ------ | ------- | ----- | ----------------------------------- |
| GET    | `/`     | –     | List members (query: `tier`)        |
| POST   | `/`     | Admin | Create member                       |
| PATCH  | `/:id`  | Admin | Update member                       |
| DELETE | `/:id`  | Admin | Delete member                       |

### Impact stats — `/impact`
| Method | Path    | Auth  | Description        |
| ------ | ------- | ----- | ------------------ |
| GET    | `/`     | –     | List impact stats  |
| POST   | `/`     | Admin | Create stat        |
| PATCH  | `/:id`  | Admin | Update stat        |
| DELETE | `/:id`  | Admin | Delete stat        |

### Contact — `/contact`
| Method | Path            | Auth  | Description                  |
| ------ | --------------- | ----- | --------------------------- |
| POST   | `/`             | –     | Submit `{ name, email, subject?, message }` |
| GET    | `/`             | Admin | List messages               |
| PATCH  | `/:id/handled`  | Admin | Mark message handled        |

### Donations — `/donations`
| Method | Path  | Auth       | Description                                  |
| ------ | ----- | ---------- | -------------------------------------------- |
| POST   | `/`   | Guest/User | Donate `{ name, email, amount, project?, message? }` |
| GET    | `/`   | Admin      | List donations                               |

### Volunteers — `/volunteers`
| Method | Path           | Auth  | Description                                       |
| ------ | -------------- | ----- | ------------------------------------------------- |
| POST   | `/`            | –     | Apply `{ name, email, phone?, interest?, message? }` |
| GET    | `/`            | Admin | List applications                                 |
| PATCH  | `/:id/status`  | Admin | Update status (`NEW`/`REVIEWING`/`ACCEPTED`/`DECLINED`) |

---

## Money / totals rules

Mirrored from the frontend cart so the backend is the source of truth:
- **Shipping:** flat **GHS 25** when the cart has items, else 0.
- **Tax:** **5%** of subtotal, rounded to the nearest cedi.
- **Donation:** optional add-on (e.g. the "Plant a tree for GHS 10" upsell).
- **Total** = subtotal + shipping + tax + donation.

Order line items **snapshot** the product name and price at purchase time, so
later catalog changes never rewrite historical orders.

---

## Error format

All errors return a consistent envelope:
```json
{ "error": { "message": "Human-readable message", "details": [ ... ] } }
```
- `400` bad request · `401` unauthorized · `403` forbidden · `404` not found ·
  `409` conflict · `422` validation failed · `500` server error.

---

## npm scripts

| Script                   | Purpose                          |
| ------------------------ | -------------------------------- |
| `npm run dev`            | Start with file watching         |
| `npm start`              | Start the server                 |
| `npm run prisma:migrate` | Create/apply a dev migration     |
| `npm run prisma:deploy`  | Apply migrations in production    |
| `npm run prisma:studio`  | Open Prisma Studio (DB browser)  |
| `npm run db:seed`        | Seed the database                |

---

## Connecting the existing frontend

The static pages currently use `localStorage` for the cart and hard-coded
content. To wire them to this API:
- Replace `addToCart(...)` / cart rendering with calls to `/api/cart`
  (for logged-in users) or keep `localStorage` and send the item list to
  `POST /api/orders` at checkout for guests.
- Populate `shop.html`, `index.html` (events), `main.html` (team), and
  `impact.html` from their respective `GET` endpoints.
- Point the newsletter, contact, donation, and volunteer forms at their `POST`
  endpoints instead of the external form link.

Set `CORS_ORIGINS` to the origin serving the static files.
