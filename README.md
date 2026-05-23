# To-Do List Application

A clean, auth-ready full-stack task management app with persistent PostgreSQL storage.

## Features

- ✅ JWT authentication APIs (`register`, `login`, `me`)
- ✅ Protected task APIs with ownership checks
- ✅ Full CRUD on tasks (`create`, `read`, `update`, `delete`)
- ✅ Task priority levels (Low / Medium / High) with color badges
- ✅ Inline edit mode for tasks
- ✅ Filter tasks (all / active / done)
- ✅ Search tasks by title/description
- ✅ Update user profile (name, email, password)
- ✅ Admin panel with sidebar (Dashboard, Users, All Tasks)
- ✅ Full admin CRUD for users and tasks via modal forms
- ✅ Automatic toast notifications
- ✅ Loading skeletons and empty states
- ✅ Fully responsive React + Vite frontend

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express 4 |
| Database | PostgreSQL via Sequelize ORM |
| Auth | JWT + bcryptjs |

## Project Structure

```text
todo-list-app/
  client/    # React + Vite frontend
  server/    # Express + PostgreSQL backend
```

## Quick Start

### 1. Install dependencies

```bash
npm install
npm run install-all
```

### 2. PostgreSQL setup

1. **Install PostgreSQL** (if not already installed):
   - Windows: [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

2. **Create a database**:
   ```sql
   CREATE DATABASE todo_app;
   ```

3. **Create server `.env`** (inside `server/`):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=todo_app
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_secure_random_secret
   CLIENT_ORIGIN=http://localhost:5173
   ```

Sequelize will auto-create the tables on first run.

### 3. Seed admin account (optional)

```bash
npm run seed
```

**Default Master Admin Credentials** (⚠️ Change after first login):
- **Email**: `master@admin.com`
- **Password**: `MasterAdmin@2026`

### 4. Run the app

```bash
npm run dev
```

Opens:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/profile` | Update profile |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/tasks` | List own tasks |
| POST | `/api/v1/tasks` | Create task |
| PUT | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task |

### Admin (requires admin role)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/v1/admin/stats` | Dashboard stats |
| GET/POST | `/api/v1/admin/users` | List / create users |
| PUT/DELETE | `/api/v1/admin/users/:id` | Update / delete user |
| GET/POST | `/api/v1/admin/tasks` | List / create tasks |
| PUT/DELETE | `/api/v1/admin/tasks/:id` | Update / delete task |

### 5. Run the app

From the project root:

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`
- **Health check**: `GET http://localhost:5000/api/v1/health`

## API Summary

### Authentication

```
POST   /api/v1/auth/register    (email, name, password)
POST   /api/v1/auth/login       (email, password)
GET    /api/v1/auth/me          (Bearer token)
```

### Tasks (Protected - Requires Bearer Token)

```
GET    /api/v1/tasks            (list all user tasks)
POST   /api/v1/tasks            (create new task)
GET    /api/v1/tasks/:id        (get single task)
PUT    /api/v1/tasks/:id        (update task)
DELETE /api/v1/tasks/:id        (delete task)
```

## Example Task Payload

```json
{
  "title": "Ship portfolio refresh",
  "description": "Deploy latest UI to production",
  "completed": false,
  "dueDate": "2026-06-01"
}
```

## UI Features

- **Task Filters**: All, Active, Done
- **Search**: Full-text search across title and description
- **Inline Editing**: Click edit icon to modify task details
- **Toggle Status**: Mark tasks done/pending inline
- **Auto-notifications**: Toast alerts for all actions
- **Loading States**: Skeleton cards while fetching
- **Empty States**: Helpful messaging when no tasks exist
- **Responsive Design**: Mobile-first layout

## Development Commands

```bash
# Run both client and server
npm run dev

# Run client only
npm run dev:client

# Run server only  
npm run dev:server

# Build client for production
npm run build --prefix client

# Start server (production)
cd server && npm start
```

