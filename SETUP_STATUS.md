# To-Do List Application - Setup & Status Report
**Generated: May 18, 2026**

## 📁 Project Folder Location

The application is currently located at:
```
C:\Users\hp\Desktop\UoG-Projects\GithubRepository\todo-list-app\
```

**To rename to "To-Do List Application":**
1. Close VS Code and all terminals
2. Right-click the `todo-list-app` folder in File Explorer
3. Click "Rename" and type: `To-Do List Application`

Or via PowerShell (after closing all processes):
```powershell
cd C:\Users\hp\Desktop\UoG-Projects\GithubRepository
Rename-Item -Path "todo-list-app" -NewName "To-Do List Application"
```

---

### Frontend (React + Vite)
- ✅ Complete authentication UI (register/login)
- ✅ Main task dashboard
- ✅ Task CRUD operations (Create, Read, Update, Delete)
- ✅ **NEW:** Inline edit mode for tasks
- ✅ **NEW:** Task filter tabs (All / Active / Done)
- ✅ **NEW:** Full-text search functionality
- ✅ **NEW:** Auto-dismissing toast notifications
- ✅ **NEW:** Skeleton loading skeletons
- ✅ **NEW:** Empty state messaging
- ✅ **NEW:** Polished responsive design with CSS variables
- ✅ Production build passes validation (192 KB gzipped)

### Backend (Express + Node.js + PostgreSQL)
- ✅ User authentication (register, login, me endpoint)
- ✅ Password hashing with bcryptjs
- ✅ JWT token generation and validation
- ✅ **NEW:** Role-based access (user / admin)
- ✅ **NEW:** Admin flag support
- ✅ Task CRUD API endpoints
- ✅ Task ownership validation (users can only see their tasks)
- ✅ Error middleware with proper HTTP status codes
- ✅ CORS configured for frontend communication
- ✅ **NEW:** Admin middleware for protected admin routes
- ✅ **NEW:** Database seed script for default admin account
- ✅ Syntax validation passes

### Database (PostgreSQL)
- ✅ User model with fields: name, email, password, role, isAdmin, timestamps
- ✅ Task model with fields: title, description, completed, priority, dueDate, owner, timestamps
- ✅ Sequelize schema validation and UUID primary keys
- ✅ Auto-migration guard for new columns on existing databases

### Application Naming
- ✅ Renamed from "MERN App" to "**To-Do List Application**"
- ✅ Updated all UI titles and copy
- ✅ Updated documentation
- ✅ Updated HTML page title

---

## 📋 What Still Needs to Be Done

### 1. **PostgreSQL Setup (REQUIRED to run)**
   - Install PostgreSQL and create a database named `todo_app`
   - Create `server/.env` with your DB credentials:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=todo_app
     DB_USER=postgres
     DB_PASSWORD=your_password
     JWT_SECRET=your_secure_random_secret
     CLIENT_ORIGIN=http://localhost:5173
     ```
   - Sequelize will auto-create all tables on first run

### 2. **Initialize Admin Account**
   ```bash
   cd server
   npm run seed
   ```
   
   **Master Admin Credentials:**
   - Email: `master@admin.com`
   - Password: `MasterAdmin@2026`
   - ⚠️ Change after first login!

### 3. **Run the Application**
   ```bash
   # From project root (todo-list-app/)
   npm run dev
   ```
   
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - API Health: http://localhost:5000/api/v1/health

---

## 🔑 **Default Master Admin Account**

```
Email:    master@admin.com
Password: MasterAdmin@2026
```

⚠️ **Change immediately after first login!**

**How to create the admin account:**
```bash
cd server
npm run seed
```

This will initialize the database with the master admin account if it doesn't already exist.

---

## 📁 Project File Structure

```
todo-list-app/
  client/
    src/
      components/     # Auth, TaskForm, TaskList, TaskItem
      api/            # HTTP client, auth/tasks API
      context/        # AuthContext for state management
      App.jsx         # Main app with filters, search, notifications
      styles.css      # Complete design system with CSS variables
      main.jsx
    index.html        # Updated title: "To-Do List Application"
    package.json
    vite.config.js
    .env.example
  
  server/
    src/
      models/         # User, Task schemas
      controllers/    # Auth, task CRUD logic
      routes/         # Auth, task API routes
      middleware/     # Auth, error, admin middleware
      config/         # Database connection
      utils/          # Token generation
      app.js          # Express app setup
      server.js       # Server entry point
      seed.js         # NEW: Admin initialization script
    package.json      # NEW: Added "seed" script
    .env.example
```

---

## ✨ Key Technologies Used

- **Frontend:** React 18, Vite 8, Axios
- **Backend:** Express 4, Node.js
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Database:** PostgreSQL via Sequelize 6 ORM

---

## 🚀 Next Development Tasks (Priority Order)

1. [ ] Deploy app (Vercel for frontend, Heroku/Railway for backend)
2. [ ] Add admin dashboard
3. [ ] Implement refresh token flow
4. [ ] Add task categories/tags
5. [ ] Task due date reminders
6. [ ] Dark mode toggle
7. [ ] Unit & integration tests
8. [ ] Email notifications
9. [ ] Deployment documentation

---

## 🛠️ Testing Checklist

- [ ] User registration flow
- [ ] User login with JWT token
- [ ] Create task
- [ ] Read/display tasks
- [ ] Update task (inline edit)
- [ ] Toggle task complete/incomplete
- [ ] Delete task
- [ ] Search functionality
- [ ] Filter (All/Active/Done)
- [ ] Toast notifications appear/disappear
- [ ] Responsive design on mobile
- [ ] Admin seed creates account
- [ ] Admin account can login

---

## ❓ FAQ

**Q: Can I run without PostgreSQL installed locally?**
A: You need a PostgreSQL instance. You can use a free cloud PG provider like [Neon](https://neon.tech) or [Supabase](https://supabase.com) and set the DB credentials in `server/.env`.

**Q: Where do I change default admin password?**
A: After login with default admin credentials, update your profile (feature available in future release).

**Q: How do I reset the database?**
A: Drop the database and run `npm run seed` again.

**Q: Can regular users become admins?**
A: Yes. Use the Admin Panel → Users page to edit any user and toggle the admin flag.
