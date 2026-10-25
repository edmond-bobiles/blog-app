# Blog App Setup & Run Instructions

## Start

From the repo root:

    npm install
    npm run dev

This will:
- Install/verify Python dependencies (via a virtual environment)
- Start the FastAPI backend at http://127.0.0.1:8000
- Start the frontend at http://127.0.0.1:5500

## Deploy to Vercel

Import this repository into Vercel and leave the project root, build command,
and output directory at their defaults. Vercel detects the FastAPI entry point
in `main.py`, installs the Python packages from the root `requirements.txt`,
and serves the static pages and JavaScript from `public/`.

The API and frontend use the same Vercel domain. For persistent user, post, and
comment data, provision a PostgreSQL database and add its connection string as
the `DATABASE_URL` environment variable in Vercel, then redeploy. Without that
variable the app falls back to a SQLite database under `/tmp`; Vercel may clear
that data between function instances or deployments.

