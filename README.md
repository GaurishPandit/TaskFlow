# TaskFlow — Kanban Task Manager (MERN)

A full-stack project management application built with the **MERN stack** (MongoDB, Express, React, Node.js). Users can register, create projects, and manage tasks on a drag-and-drop Kanban board with three columns (**To Do**, **In Progress**, and **Done**).

> Built as a portfolio project to demonstrate authentication, REST API design, protected routes, responsive UI design, and full-stack deployment.

---

## 🌐 Live Demo

**Frontend:** https://task-sync-five.vercel.app

**Backend API:** https://tasksync-api-bdmb.onrender.com

---

## ✨ Features

- **JWT Authentication** — Secure registration and login using hashed passwords (bcrypt) and JSON Web Tokens.
- **Protected Routes & APIs** — Middleware secures all project and task endpoints, with automatic client-side redirection for unauthenticated users.
- **Project Management** — Create, color-code, and delete projects. Deleting a project automatically removes all associated tasks.
- **Kanban Board** — Native HTML5 drag-and-drop between **To Do**, **In Progress**, and **Done** columns with optimistic UI updates.
- **Task Management** — Create, edit, delete, and organize tasks with title, description, priority, status, and due date.
- **Completed Tasks Section** — Mark tasks complete with one click and manage completed tasks separately while preserving analytics.
- **Analytics Dashboard** — Completion rate, task counts, weekly/monthly progress, deadline tracking, and per-project statistics using custom SVG charts.
- **Deadline Tracking** — Automatically highlights upcoming and overdue tasks.
- **User Isolation** — Every user can access only their own projects and tasks.
- **Responsive Dark UI** — Fully responsive interface built using custom CSS without any component libraries.
- **Additional Features** — API rate limiting, centralized error handling, and demo data seeding.

---

## 🧱 Tech Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React 18, React Router, Axios, Vite, Context API |
| Backend | Node.js, Express.js, JWT, bcryptjs, express-rate-limit |
| Database | MongoDB Atlas, Mongoose |
| Deployment | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 📁 Project Structure

```text
taskflow/
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       │   └── seed.js
│       └── index.js
│
└── client/
    └── src/
        ├── api/
        ├── components/
        │   └── charts/
        ├── context/
        ├── pages/
        └── styles/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas connection string (recommended) or a local MongoDB instance

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Update the `.env` file with your own values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

(Optional) Seed demo data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

Visit:

```
http://localhost:5173
```

---

## 🔌 API Reference

All `/projects`, `/tasks`, and `/analytics` routes require:

```
Authorization: Bearer <token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current authenticated user |
| GET | `/api/projects` | Retrieve all projects |
| POST | `/api/projects` | Create a new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project and associated tasks |
| GET | `/api/tasks?project=` | Retrieve tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/analytics/summary?range=week\|month` | Analytics summary |

---

## 🛠 Deployment

The application is deployed using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

For production deployment:

1. Deploy the Express backend to Render.
2. Deploy the React frontend to Vercel.
3. Configure environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLIENT_URL`
   - `VITE_API_URL`
4. Update `CLIENT_URL` in the backend after deploying the frontend.

---

## 🗺️ Future Improvements

- Reorder tasks within a column with persistent ordering
- Team workspaces and shared projects
- Role-based permissions
- Task comments and activity history
- Email reminders and notifications
- Unit and integration testing

---

## 📄 License

This project is licensed under the **MIT License**.
