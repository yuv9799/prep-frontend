# Prep Frontend

Vite + React frontend for PrepForge.

## Local development

1. Install dependencies: `npm ci`.
2. Keep `VITE_API_URL=/api` in `.env.local` so Vite proxies API requests to `http://localhost:8080`.
3. Start the backend in the separate `prep-backend` repository, then run `npm run dev`.
4. Run checks with `npm run typecheck`, `npm test`, and `npm run build`.

## Production API connection

The frontend must point to the deployed backend, not to `/api` on the static hosting domain. In GitHub, open **Settings → Secrets and variables → Actions → Variables**, create a repository variable named `VITE_API_URL`, and set it to the deployed backend base URL ending in `/api` (for example `https://your-service.onrender.com/api`). Then run **Actions → Deploy Prep Frontend to GitHub Pages → Run workflow** on `master`.

The deploy workflow sets `GITHUB_PAGES=true`, builds assets under `/prep-frontend/`, and preserves SPA routes on refresh. A missing production API variable produces a clear configuration error instead of sending requests to a GitHub Pages 404 page.

Live site: https://yuv9799.github.io/prep-frontend/

Do not commit `.env.local` or production secrets.
