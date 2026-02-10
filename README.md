# Personal Finance Dashboard – Next.js + Docker

This repo contains a **Next.js (React) application** set up to run entirely inside **Docker**, so you do **not** need Node.js or npm installed on your host machine.  
The development environment supports **hot reloading**.

> **Note on Vite**  
> Next.js uses its own dev server and build pipeline (including Turbopack) rather than Vite.  
> To keep the stack standard and stable, this project uses the official Next.js tooling, which provides Vite‑like fast hot reloading out of the box.

---

## Project structure

- `package.json` – project metadata and scripts
- `next.config.mjs` – Next.js configuration
- `tsconfig.json` / `next-env.d.ts` – TypeScript configuration
- `app/` – App Router pages and global styles
  - `app/layout.tsx` – root layout with top navigation
  - `app/page.tsx` – home page
  - `app/payments/` – record daily payments (amount, description, category)
  - `app/records/` – list and filter expenses (category, date range, amount range)
  - `app/stats/` – bar chart of expenses by category (same filters as Records)
  - `app/globals.css` – global styles
- `Dockerfile` – production image (optimized build)
- `Dockerfile.dev` – development image (hot reload)
- `docker-compose.yml` – dev environment with volume mounts
- `.dockerignore` – files excluded from the Docker build context
- `database/` – database schema and Supabase setup
  - `schema.sql` – PostgreSQL schema (expenses, financial advice, etc.)
  - `supabase-rls.sql` – Row Level Security for Supabase
  - `README.md` – **Supabase setup steps** and local PostgreSQL options

---

## Database (Supabase)

The app uses **Supabase** for the database (PostgreSQL) when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. Otherwise it runs with an **in-memory store** (data is lost on restart). For full setup (project creation, running schema, RLS, env vars, and optional demo seed), see **[database/README.md](database/README.md)**.

---

## Prerequisites

- **Docker** installed and running on your machine.
- **Docker Compose** (comes bundled with recent Docker Desktop versions).

No local Node.js / npm is required – everything runs inside containers.

---

## NPM scripts (executed inside Docker)

- **`npm run dev`** – start the Next.js dev server with hot reloading.
- **`npm run build`** – create an optimized production build.
- **`npm run start`** – start the production server (after `npm run build`).
- **`npm run lint`** – run ESLint.

You generally use these via Docker (see below), not directly on your host.

---

## Development environment (hot reloading)

This setup uses **`docker-compose`** and `Dockerfile.dev` for a pleasant dev experience:

- Host project directory is mounted into the container.
- File changes on the host are reflected immediately inside the container.
- Next.js dev server provides hot reloading in the browser.

### 1. Start the dev server

From the project root:

```bash
docker compose up --build
```

or, depending on your Docker version:

```bash
docker-compose up --build
```

What this does:

- Builds an image using `Dockerfile.dev`.
- Installs Node dependencies **inside** the container.
- Starts `npm run dev` on port **3000**.
- Mounts your current directory into `/app` in the container (except `node_modules`).

### 2. Open the app in your browser

Navigate to:

```text
http://localhost:3000
```

You should see the **Personal Finance Dashboard** placeholder page.

### 3. Verify hot reloading

1. Open `app/page.tsx`.
2. Change some text in the JSX.
3. Refresh or keep the page open – the browser should automatically update within a second or two.

If you don’t see changes:

- Make sure Docker is running and `docker compose up` is still active.
- Ensure your editor is saving files to disk (auto-save or manual save).

### 4. Stopping the dev environment

In the terminal where `docker compose up` is running, press:

- `Ctrl + C`

To clean up containers (optional):

```bash
docker compose down
```

---

## Production build & run (optional)

For a production-style container, you can use the main `Dockerfile`.

### 1. Build the production image

From the project root:

```bash
docker build -t personal-finance-dashboard .
```

This will:

- Install dependencies.
- Build the Next.js app (`npm run build`).
- Create a final runtime image that runs `npm run start`.

### 2. Run the production container

```bash
docker run --rm -p 3000:3000 personal-finance-dashboard
```

Visit:

```text
http://localhost:3000
```

Note: this image is intended for production testing; there is **no hot reloading** in this mode.

---

## Customizing the app

- **Pages & layout**: modify `app/page.tsx` and `app/layout.tsx`.
- **Global styles**: edit `app/globals.css`.
- **Dependencies**: add any new packages to `package.json`; then rebuild your dev container:

```bash
docker compose build web
docker compose up
```

---

## Summary of steps to start developing

1. **Clone or open** this project.
2. In a terminal at the project root, run:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:3000` in your browser.
4. Edit files under `app/` – changes are hot reloaded automatically.

