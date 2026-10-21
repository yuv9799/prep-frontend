# Prep Frontend

Frontend application for the Prep project.

## Live site

https://yuv9799.github.io/prep-frontend/

## GitHub Pages deployment

The `.github/workflows/deploy.yml` workflow builds the Vite app for the repository subpath. It sets `GITHUB_PAGES=true`, which makes Vite generate asset URLs under `/prep-frontend/`. The React Router uses Vite's base URL so deep links work, and `public/.nojekyll` disables Jekyll processing of the static artifact.

The Pages artifact must reference assets under `/prep-frontend/assets/` (not `/assets/`). Check the **Actions** tab for the “Deploy Prep Frontend to GitHub Pages” run after source changes. If no run starts, choose **Actions → Deploy Prep Frontend to GitHub Pages → Run workflow** on branch `master`.

## Requirements
- Node.js 22 or compatible
- npm

## Setup
1. Install dependencies: `npm ci`
2. Copy `.env.example` to `.env.local` and configure the backend API URL if required.
3. Run locally: `npm run dev`
4. Check types/build/tests using the scripts declared in `package.json`.

The backend service lives in the separate `prep-backend` repository. Do not commit real environment secrets.
