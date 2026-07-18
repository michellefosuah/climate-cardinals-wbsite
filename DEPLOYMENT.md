# Deployment guide — Climate Cardinals KNUST

This gets the site **fully working** (real checkout, accounts, form submissions)
by putting the backend API online and pointing the frontend at it.

There are two pieces:

1. **Backend API + database** → hosted on **Render** (free tier).
2. **Frontend** (the HTML/CSS/JS) → hosted as static files (**GitHub Pages**,
   Netlify, or Render Static — GitHub Pages steps below).

> Until you do this, the site still runs in **Demo mode** (browsable with
> sample data). Deploying is what enables checkout, sign-in and form saving.

---

## Part 1 — Deploy the backend to Render

**You need:** a free account at <https://render.com> (sign in with GitHub).

1. **Push this repo to GitHub** (already done for the working branch). Make sure
   `render.yaml` is in the repo root.
2. In Render, click **New → Blueprint**.
3. Choose this repository. Render reads `render.yaml` and shows a plan:
   - a **PostgreSQL** database (`climate-cardinals-db`), and
   - a **web service** (`climate-cardinals-api`).
4. It will prompt for the one secret marked "sync: false":
   - **SEED_ADMIN_PASSWORD** — pick a strong password (this is the admin login
     you'll use later). Everything else is filled in automatically.
5. Click **Apply**. Render will:
   - create the database,
   - install dependencies, run migrations, and seed the data,
   - start the API.
6. When it finishes, open the service URL. Visit `.../health` — you should see
   `{"status":"ok",...}`. Your API base is that URL **+ `/api`**, e.g.
   `https://climate-cardinals-api.onrender.com/api`.

> **Free-tier note:** the service sleeps after ~15 min idle and takes ~30s to
> wake on the next visit. That's normal; upgrade the instance to keep it warm.

---

## Part 2 — Point the frontend at your API

Open **`js/config.js`** and paste your API base into `PROD_API_BASE`:

```js
var PROD_API_BASE = 'https://climate-cardinals-api.onrender.com/api';
```

Commit and push. (Locally, the site keeps using `http://localhost:4000/api`
automatically — only non-local visitors use `PROD_API_BASE`.)

> Quick test without editing code: open the site, then in the browser console run
> `localStorage.setItem('cc_api_base','https://YOUR-API.onrender.com/api')` and
> reload.

---

## Part 3 — Publish the frontend (GitHub Pages)

1. Merge the working branch into `main` (or publish from your chosen branch).
2. On GitHub: **Settings → Pages**.
3. **Source:** Deploy from a branch → **Branch:** `main` → **Folder:** `/ (root)`
   → **Save**.
4. After a minute your site is live at
   `https://<your-username>.github.io/climate-cardinals-wbsite/`.
   The home page is **`main.html`**; the Pages root shows the events page
   (`index.html`).

---

## Part 4 — Lock down CORS

Back in Render → your web service → **Environment**, set **CORS_ORIGINS** to your
frontend origin (no trailing slash), e.g.:

```
https://michellefosuah.github.io
```

Save; Render redeploys. (Leaving it `*` also works but is less strict.)

---

## Verify it's live

- Visit the deployed site — the **Demo mode** banner should be gone and content
  loads from the API.
- Add an item → checkout → you get a real order confirmation with a reference.
- Sign up / log in works; contact, volunteer, donate and event registration save.

**Admin:** log in with `SEED_ADMIN_EMAIL` and the password you set. Admin-only API
routes (product/event/order management) are then available with your token.

---

## Alternative: run everything locally

```bash
# 1. Database — a local PostgreSQL, then:
cd backend
cp .env.example .env         # set DATABASE_URL, and a JWT_SECRET (16+ chars)
npm install
npm run prisma:migrate
npm run db:seed
npm start                    # API at http://localhost:4000

# 2. Frontend — from the project root, in another terminal:
python3 -m http.server 5500  # site at http://localhost:5500/main.html
```

`js/config.js` already targets `http://localhost:4000/api` when you browse via
localhost, so it just works.

---

## Alternative host: Docker

`backend/Dockerfile` builds a self-contained API image (for Railway, Fly.io, or
any container host). Provide a `DATABASE_URL` and `JWT_SECRET`; the container runs
migrations + seed on boot. Example:

```bash
cd backend
docker build -t climate-cardinals-api .
docker run -p 4000:4000 -e DATABASE_URL=... -e JWT_SECRET=... climate-cardinals-api
```
