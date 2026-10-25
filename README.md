# Blog App

A small full-stack blog application with a browser-based interface and a FastAPI backend. Users can sign up, log in, publish posts, browse posts, and add or remove comments.

## Built with

- **Frontend:** HTML, JavaScript, and Tailwind CSS
- **Backend:** Python, FastAPI, and SQLAlchemy
- **Database:** SQLite for local development; PostgreSQL is supported for deployment

## Run locally

### Requirements

- Node.js and npm
- Python 3.10 or later

From the project root, install the Node.js dependencies and start the app:

```bash
npm install
npm run dev
```

The first run creates a Python virtual environment and installs the backend dependencies. The app then starts:

- Frontend: <http://127.0.0.1:5500>
- API: <http://127.0.0.1:8000>
- Interactive API docs: <http://127.0.0.1:8000/docs>

## Demo accounts

To load the sample accounts and example post, run the seed script from the backend directory:

```bash
cd backend
.venv/bin/python seed.py
```

The sample usernames and passwords are listed in [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md). You can also create an account from the signup page.


## Project layout

```text
backend/       FastAPI routes, database models, and seed script
public/        HTML pages and browser JavaScript
main.py        Vercel FastAPI entry point
requirements.txt  Python dependencies used by Vercel
```


