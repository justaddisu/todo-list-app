import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminTasks from "./components/admin/AdminTasks";
import AdminUsers from "./components/admin/AdminUsers";
import AuthForm from "./components/AuthForm";
import ProfileModal from "./components/ProfileModal";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import { useAuth } from "./context/AuthContext";
import {
  createTaskRequest,
  deleteTaskRequest,
  listTasksRequest,
  updateTaskRequest,
} from "./api/tasksApi";

const FILTERS = ["all", "active", "done"];
const getTaskId = (task) => task.id || task._id;

export default function App() {
  const { user, login, logout, register, isAuthenticated, isBootstrapping } = useAuth();
  const [authMode, setAuthMode] = useState("login");
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const msgTimerRef = useRef(null);
  const [adminView, setAdminView] = useState(false);
  const [adminPage, setAdminPage] = useState("dashboard");
  const [showProfile, setShowProfile] = useState(false);

  const notify = useCallback((text, type = "info") => {
    setMessage({ text, type });
    clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  }, []);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (filter === "active") return !t.completed;
        if (filter === "done") return t.completed;
        return true;
      })
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
  }, [tasks, filter, search]);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await listTasksRequest();
      setTasks(data);
    } catch (error) {
      notify(error.response?.data?.message || "Could not fetch tasks", "error");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleAuthSubmit = async (formData) => {
    setAuthLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (authMode === "register") {
        await register(formData);
      } else {
        await login({ email: formData.email, password: formData.password });
      }
    } catch (error) {
      notify(error.response?.data?.message || "Authentication failed", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateTask = async (task) => {
    try {
      const created = await createTaskRequest(task);
      setTasks((prev) => [created, ...prev]);
      notify("Task created successfully", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not create task", "error");
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const updated = await updateTaskRequest(getTaskId(task), { completed: !task.completed });
      setTasks((prev) => prev.map((item) => (getTaskId(item) === getTaskId(updated) ? updated : item)));
    } catch (error) {
      notify(error.response?.data?.message || "Could not update task", "error");
    }
  };

  const handleEditTask = async (id, payload) => {
    try {
      const updated = await updateTaskRequest(id, payload);
      setTasks((prev) => prev.map((item) => (getTaskId(item) === getTaskId(updated) ? updated : item)));
      notify("Task updated", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not update task", "error");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTaskRequest(id);
      setTasks((prev) => prev.filter((task) => getTaskId(task) !== id));
      notify("Task deleted", "info");
    } catch (error) {
      notify(error.response?.data?.message || "Could not delete task", "error");
    }
  };

  if (isAuthenticated && adminView) {
    const page =
      adminPage === "users" ? (
        <AdminUsers currentUserId={user?.id} />
      ) : adminPage === "tasks" ? (
        <AdminTasks />
      ) : (
        <AdminDashboard />
      );

    return (
      <AdminLayout
        activePage={adminPage}
        onNavigate={setAdminPage}
        onExitAdmin={() => setAdminView(false)}
        onLogout={logout}
        user={user}
      >
        {page}
      </AdminLayout>
    );
  }

  if (isBootstrapping) {
    return (
      <main className="container">
        <div className="skeleton-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="container auth-view">
        <section className="hero panel">
          <h1>📋 To-Do List Application</h1>
          <p>Persistent task management with JWT-backed APIs and PostgreSQL storage.</p>
          <span className="badge">auth-ready</span>
        </section>

        <AuthForm mode={authMode} onSubmit={handleAuthSubmit} loading={authLoading} />

        <button
          className="toggle-mode"
          type="button"
          onClick={() => setAuthMode((prev) => (prev === "login" ? "register" : "login"))}
        >
          {authMode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </button>

        {message.text && (
          <p className={`toast toast--${message.type}`}>{message.text}</p>
        )}
      </main>
    );
  }

  return (
    <main className="container app-view">
      <header className="panel topbar">
        <div className="topbar-left">
          <h1>📋 Tasks</h1>
          <p className="stats">
            <strong>{completedCount}</strong> / {tasks.length} done
          </p>
        </div>
        <div className="topbar-right">
          <button
            type="button"
            className="profile-btn"
            onClick={() => setShowProfile(true)}
            title="Edit profile"
          >
            <span className="topbar-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <span className="user-badge">{user?.name}</span>
          </button>
          {user?.isAdmin && (
            <button
              type="button"
              className="admin-panel-btn"
              onClick={() => { setAdminPage("dashboard"); setAdminView(true); }}
            >
              ⚙️ Admin
            </button>
          )}
          <button type="button" className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {message.text && (
        <p className={`toast toast--${message.type}`}>{message.text}</p>
      )}

      <TaskForm onCreate={handleCreateTask} />

      <section className="controls panel">
        <input
          className="search-input"
          type="search"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-group">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <TaskList
        tasks={visibleTasks}
        loading={loadingTasks}
        onToggle={handleToggleTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </main>
  );
}
