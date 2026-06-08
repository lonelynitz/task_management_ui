# Task Management Frontend

A React SPA with Vite, TailwindCSS, TanStack Query, and React Router for the Task Management application.

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS v4
- **State/Data:** TanStack Query (React Query)
- **Routing:** React Router v7 (BrowserRouter)
- **HTTP Client:** Axios
- **Language:** JavaScript (JSX)

## Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running (local or deployed)

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL="http://localhost:5000"
```

> **Note:** For local development, `VITE_API_URL` should point to your backend server. If not set, it falls back to `/api` (used with Vite's proxy).

### 3. Start the development server

```bash
npm run dev
```

The app will start at `http://localhost:3000`.

The Vite dev server proxies `/api` requests to `http://localhost:5000` (configured in `vite.config.js`).

## Build for Production

```bash
npm run build
```

Output goes to the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Docker Setup

```bash
# From the project root
docker compose up --build
```

The frontend will be served on port `80` via Nginx.

## Vercel Deployment

### Environment Variables

Set these in your Vercel project dashboard (Settings → Environment Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (no trailing slash) | `https://your-backend.vercel.app` |

> **Important:** Vite requires env vars to start with `VITE_` to be exposed to the client. After setting env vars, you must **redeploy** for changes to take effect.

### Deploy

Push to your Git repository. Vercel will auto-deploy using the `vercel.json` configuration with SPA routing support.

## Pages & Features

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Login page | Public |
| `/dashboard` | User dashboard - view and update assigned tasks | Authenticated users |
| `/admin` | Admin dashboard - manage users and tasks | Admin only |
| `/*` | Redirects to `/dashboard` or `/login` | - |

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── index.js         # Axios instance & API methods
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication context provider
│   ├── pages/
│   │   ├── Login.jsx         # Login page
│   │   ├── AdminDashboard.jsx # Admin dashboard
│   │   └── UserDashboard.jsx  # User dashboard
│   ├── App.jsx               # Router & route definitions
│   ├── main.jsx              # App entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js            # Vite config with API proxy
├── eslint.config.js
├── vercel.json               # Vercel SPA routing config
└── Dockerfile                # Multi-stage Docker build
```

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |

> Credentials are seeded by the backend on first run.
