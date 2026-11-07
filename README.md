# Blog App

A modern, full-stack blog application featuring a lightweight static frontend styled with Tailwind CSS and a fast RESTful backend powered by FastAPI, SQLAlchemy, and SQLite/PostgreSQL.

---

## Features

- **User Authentication & Management**
  - User registration and login with client-side session persistence (`localStorage`).
  - Self-service password reset functionality.
  - Interactive password visibility toggle on all auth forms.
- **Blog Posts & Publishing**
  - Create and publish articles with titles and descriptions.
  - Public blog feed displaying posts alongside author names and comment counts.
  - Dedicated post detail view (`singlePost.html`) displaying full article content.
- **Discussion & Comments**
  - Nested comment threads under each post.
  - Add new comments in real time.
  - Delete comments with author/ownership tracking.
- **Responsive UI & Security**
  - Responsive design crafted with [Tailwind CSS](https://tailwindcss.com/) and [Inter font](https://rsms.me/inter/).
  - Mobile-friendly navigation with collapsible drawer menu.
  - Built-in XSS sanitization (`escapeHtml`) on dynamic content rendering.
  - Automatic API base URL detection (local development vs. production).


---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, Tailwind CSS (CDN), Inter Typography |
| **Backend** | Python 3.10+, [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pydantic v2](https://docs.pydantic.dev/) |
| **Database & ORM** | [SQLAlchemy 2.0](https://www.sqlalchemy.org/), SQLite (default local), PostgreSQL ([psycopg3](https://www.psycopg.org/psycopg3/)) |
| **Dev Tooling** | `concurrently` (concurrent server orchestration), Python `http.server`, Bash automation |

---

## Project Structure

```text
blog-app/
├── backend/
│   ├── database.py       # SQLAlchemy engine & dynamic DB URL connection logic
│   ├── main.py           # FastAPI application, CORS middleware, and route handlers
│   ├── models.py         # Database ORM models (User, Post, Comment)
│   ├── schemas.py        # Pydantic validation schemas for requests & responses
│   ├── seed.py           # Database seeder script with demo users and sample post
│   └── requirements.txt  # Backend Python dependencies
├── public/               # Frontend static assets
│   ├── createPost.html   # Post creation page
│   ├── forgotPassword.html # Password reset page
│   ├── index.html        # Login / landing page
│   ├── signup.html       # User registration page
│   ├── singlePost.html   # Single post reader with comment thread
│   ├── viewPosts.html    # All posts feed
│   ├── style.css         # Custom stylesheet and component styling
│   └── js/
│       ├── auth.js       # Login, signup, and reset handlers
│       ├── comments.js   # Comment submission & deletion logic
│       ├── createPost.js # Post publishing form handler
│       ├── main.js       # Auth check and logout helpers
│       ├── navbar.js     # Responsive navbar & mobile menu toggle
│       ├── password-visibility.js # Show/hide password toggles
│       ├── posts.js      # Post feed loader and card renderer
│       ├── singlePost.js # Post detail page logic
│       └── util.js       # API_BASE resolver, user cache, and HTML escaper
├── DEMO_ACCOUNTS.md      # Credentials for seeded test users
├── package.json          # Node scripts for concurrent dev environment
├── requirements.txt      # Root entry requirements for Vercel
├── setup.sh              # Virtual environment and dependency setup script
└── main.py               # Root FastAPI entry point for Vercel serverless functions
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16+) & `npm`
- [Python](https://www.python.org/) (v3.10 or later)

### Quickstart (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd blog-app
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start both backend and frontend concurrently:**
   ```bash
   npm run dev
   ```

   > **Note:** The `dev` command automatically provisions a Python virtual environment in `backend/.venv/`, installs all required dependencies from `backend/requirements.txt`, launches Uvicorn on port `8000`, and serves the frontend on port `5500`.

4. **Access the application:**
   - **Frontend:** [http://127.0.0.1:5500](http://127.0.0.1:5500)
   - **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - **Interactive API Docs (Swagger):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **Alternative API Docs (ReDoc):** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Manual Setup (Optional)

If you prefer to run the backend and frontend separately:

#### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # On Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Frontend Setup
In a new terminal window:
```bash
cd public
python3 -m http.server 5500
```

---

## Demo Accounts & Database Seeding

To quickly test the application with pre-populated accounts and a sample blog post, run the seed script:

```bash
cd backend
.venv/bin/python seed.py
```

The seeded accounts (from [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md)):

| Username | Password |
|:---|:---|
| `testuser` | `12345` |
| `isagi` | `12345` |
| `Barou` | `12345` |
| `Kaiser` | `12345` |

*You can also sign up for new accounts anytime through the web interface.*

---

## Available npm Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `concurrently ...` | Runs both backend and frontend servers simultaneously. |
| `npm run dev:backend` | `uvicorn ...` | Sets up `.venv` if missing and runs the FastAPI server. |
| `npm run dev:frontend`| `http.server 5500` | Serves static assets from `public/` on port 5500. |
| `npm run setup` | `bash setup.sh` | Manually sets up the Python virtual environment and dependencies. |
