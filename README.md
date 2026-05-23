# Habit Tracker

A MERN starter with a React + Vite frontend, Tailwind CSS styling, JWT authentication, and an Express API prepared for MongoDB through Mongoose.

## Structure

```text
backend/
  src/
    config/        # environment and database setup
    controllers/   # route handlers
    middleware/    # Express middleware
    models/        # Mongoose models
    routes/        # API routes
    services/      # token and domain services
frontend/
  src/
    components/    # reusable UI and layout
    features/      # auth, dashboard, habits, and marketing features
    services/      # API clients
```

## Run locally

Install each app from the repository root:

```bash
npm run install:all
```

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

The frontend defaults to `http://localhost:5173`. The API defaults to `http://localhost:5000` and exposes `GET /api/v1/health`.

Copy `backend/.env.example` to `backend/.env` before testing signup or login. Authentication needs `MONGODB_URI` and a long random `JWT_SECRET`.

## Authentication

The API exposes:

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/dashboard` as a protected route example
- `GET /api/v1/habits`
- `POST /api/v1/habits`
- `PATCH /api/v1/habits/:habitId`
- `PATCH /api/v1/habits/:habitId/complete`
- `DELETE /api/v1/habits/:habitId`

Passwords are hashed with bcrypt before they are stored. The API signs a JWT and sends it in an HttpOnly cookie, so the React app does not keep the token in `localStorage` or expose it to browser JavaScript. Frontend requests include credentials and protected React routes resolve the current user through `GET /api/v1/auth/me`.

Habit routes are protected by the same JWT middleware and are scoped to the authenticated user's `userId`. Streaks and recent completion rates are calculated from each habit's `completedDates`.
