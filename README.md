# TaskFlow — Kanban Task Manager (MERN)

A full-stack project management app built with the **MERN stack** (MongoDB, Express, React, Node.js). Users sign up, create projects, and manage tasks on a drag-and-drop Kanban board with three columns (To Do / In Progress / Done).

> Built as a portfolio project to demonstrate authentication, REST API design, protected routes, and a polished React UI.

---

## ✨ Features

- **JWT authentication** — register / login with hashed passwords (bcrypt), token-based sessions
- **Protected API + routes** — middleware guards every project/task endpoint; the React app redirects unauthenticated users
- **Projects** — create, color-code, and delete projects (deleting a project cascades to its tasks)
- **Kanban board** — active tasks in To Do / In Progress columns with **native HTML5 drag-and-drop** and optimistic UI updates; a one-click checkbox marks a task complete (or reopens it), moving it into a collapsible **Completed** section while keeping the record for analytics
- **Analytics dashboard** — completion rate, task counts, weekly/monthly progress charts, and per-project progress bars, all rendered as **hand-built SVG charts (no chart library)**
- **Deadline tracking** — upcoming and overdue tasks surfaced automatically, sorted by due date
- **Task details** — title, description, priority (low/medium/high), status, and due date
- **Ownership scoping** — users can only ever see and modify their own data
- **Clean, responsive dark UI** — no component library; hand-written CSS
- **Extras** — rate limiting, centralized error handling, a seed script with demo data

---

## 🧱 Tech Stack

| Layer     | Tech                                                        |
| --------- | ---------------------------------------------------------- |
| Frontend  | React 18, React Router, Axios, Vite, Context API           |
| Backend   | Node.js, Express, JWT, bcryptjs, express-rate-limit        |
| Database  | MongoDB with Mongoose                                       |

---

## 📁 Project Structure

```
taskflow/
├── server/                 # Express API
│   └── src/
│       ├── config/         # DB connection
│       ├── models/         # User, Project, Task (Mongoose schemas)
│       ├── controllers/    # Route logic (incl. analytics aggregation)
│       ├── middleware/      # auth (JWT) + error handling
│       ├── routes/         # /auth, /projects, /tasks, /analytics
│       ├── utils/seed.js   # demo data
│       └── index.js        # app entry
└── client/                 # React (Vite) frontend
    └── src/
        ├── api/            # axios instance + interceptors
        ├── context/        # AuthContext
        ├── components/     # Navbar, TaskCard, TaskModal, ProtectedRoute
        │   └── charts/     # DonutChart, BarChart (plain SVG)
        ├── pages/          # Login, Register, Dashboard, Board, Analytics
        └── styles/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally, **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### 1. Backend

```bash
cd server
npm install
cp .env.example .env        # then edit .env (set MONGO_URI and JWT_SECRET)
npm run seed                # optional: creates a demo account
npm run dev                 # starts API on http://localhost:5000
```

**Demo login (after seeding):** `demo@taskflow.dev` / `password123`

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # starts app on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to the backend, so no extra config is needed locally.

---

## 🔌 API Reference

All `/projects` and `/tasks` routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint              | Description                     |
| ------ | --------------------- | ------------------------------- |
| POST   | `/api/auth/register`  | Create account, returns a token |
| POST   | `/api/auth/login`     | Log in, returns a token         |
| GET    | `/api/auth/me`        | Get current user                |
| GET    | `/api/projects`       | List your projects              |
| POST   | `/api/projects`       | Create a project                |
| PUT    | `/api/projects/:id`   | Update a project                |
| DELETE | `/api/projects/:id`   | Delete a project + its tasks    |
| GET    | `/api/tasks?project=` | List tasks (optionally by project) |
| POST   | `/api/tasks`          | Create a task                   |
| PUT    | `/api/tasks/:id`      | Update a task (status, etc.)    |
| DELETE | `/api/tasks/:id`      | Delete a task                   |
| GET    | `/api/analytics/summary?range=week\|month` | Totals, progress timeline, per-project & deadline data |

---

## 🗺️ Ideas for Extending

Good next steps if you want to keep building (and talking about it in interviews):

- Reorder tasks within a column and persist `order`
- Team projects with shared members and role-based access
- Task comments and activity log
- Deploy: API on Render/Railway, client on Vercel/Netlify, DB on Atlas
- Unit/integration tests (Jest + Supertest, React Testing Library)

---

## 📄 License

MIT
