# Prep Frontend

Frontend application for the Prep project.

## Requirements
- Node.js 22 or compatible
- npm

## Setup
1. Install dependencies: `npm ci`
2. Copy `.env.example` to `.env.local` and configure the backend API URL if required.
3. Run locally: `npm run dev`
4. Check types/build/tests using the scripts declared in `package.json`.

The backend service lives in the separate `prep-backend` repository. Do not commit real environment secrets.
