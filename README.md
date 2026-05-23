# To-Do List Application

A clean, auth-ready full-stack task management app with persistent MongoDB storage.

## Features

- ✅ JWT authentication APIs (`register`, `login`, `me`)
- ✅ Protected task APIs with ownership checks
- ✅ Full CRUD on tasks (`create`, `read`, `update`, `delete`)
- ✅ Inline edit mode for tasks
- ✅ Filter tasks (all / active / done)
- ✅ Search tasks by title/description
- ✅ Automatic toast notifications
- ✅ Loading skeletons and empty states
- ✅ Fully responsive React + Vite frontend
- ✅ Organized full-stack project structure for scaling

## Project Structure

```text
todo-mern-app/
  client/    # React + Vite frontend
  server/    # Express + MongoDB backend
```

## Quick Start

### 1. Install dependencies:

```bash
npm install
npm run install-all
```

### 2. Backend environment setup

#### Option A: Local MongoDB (Recommended for development)

1. **Install MongoDB** (if not already installed):
   - Windows: [MongoDB Community Download](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow the [official docs](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   mongod
   ```

3. **Create server `.env`**:
   ```bash
   cd server
   copy .env.example .env
   ```
   Default config is pre-filled and will work with local MongoDB.

#### Option B: MongoDB Atlas (Cloud)

1. Create a **free tier** account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).

2. Create a cluster and get your connection URI.

3. **Create server `.env`**:
   ```bash
   cd server
   copy .env.example .env
   ```

4. **Update `.env`** with your Atlas URI:
   ```
   MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/todo_mern?retryWrites=true&w=majority
   JWT_SECRET=your_secure_random_secret_here
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=http://localhost:5173
   ```

### 3. Frontend environment (optional)

```bash
cd ../client
copy .env.example .env
```

Default points to `http://localhost:5000/api/v1`.

### 4. Seed admin account (Optional)

To create a default super admin account for testing:

```bash
cd server
npm run seed
```

**Default Master Admin Credentials** (⚠️ Change after first login):
- **Email**: `master@admin.com`
- **Password**: `MasterAdmin@2026`

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

## Next Steps

- [ ] Build admin dashboard to view all users and tasks
- [ ] Add admin-only endpoints (delete users, view all tasks, etc.)
- [ ] Implement refresh token flow & token invalidation on logout
- [ ] Add task tags/categories
- [ ] Implement task due date reminders
- [ ] Add dark mode toggle
- [ ] Write integration tests (Jest + React Testing Library)
- [ ] Deploy to Vercel + Heroku or similar

