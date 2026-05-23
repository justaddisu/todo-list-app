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
  getUpcomingRemindersRequest,
  listTasksRequest,
  shareTaskRequest,
  updateTaskRequest,
  getTagsRequest,
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
  const [selectedTag, setSelectedTag] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
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
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .filter((t) => !selectedTag || (t.tags && t.tags.includes(selectedTag)));
  }, [tasks, filter, search, selectedTag]);

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

  const fetchTags = async () => {
    try {
      const { tags } = await getTagsRequest();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Could not fetch tags", error);
    }
  };

  const fetchUpcomingReminders = async () => {
    try {
      const data = await getUpcomingRemindersRequest();
      setUpcomingReminders(data || []);
    } catch {
      setUpcomingReminders([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchTags();
      fetchUpcomingReminders();
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
      // Refresh tags if new tags were added
      if (task.tags && task.tags.length > 0) {
        fetchTags();
      }
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
      // Refresh tags if tags were modified
      if (payload.tags) {
        fetchTags();
      }
      notify("Task updated", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not update task", "error");
    }
  };
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

  const handleShareTask = async (task) => {
    const userId = window.prompt("Enter user ID to share with:");
    if (!userId) return;
    const permission = window.prompt("Permission (view/edit):", "view") || "view";
    try {
      const updated = await shareTaskRequest(getTaskId(task), {
        userId: userId.trim(),
        permission: permission.trim().toLowerCase() === "edit" ? "edit" : "view",
      });
      setTasks((prev) => prev.map((item) => (getTaskId(item) === getTaskId(updated) ? updated : item)));
      notify("Task shared", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not share task", "error");
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
          <p>Persistent task management with JWT-backed APIs and MongoDB storage.</p>
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

      {upcomingReminders.length > 0 && (
        <section className="panel">
          <h2>Upcoming reminders</h2>
          <ul style={{ margin: 0, paddingLeft: "1rem" }}>
            {upcomingReminders.slice(0, 5).map((task) => (
              <li key={task.id}>
                {task.title} {task.dueDate ? `- due ${new Date(task.dueDate).toLocaleString()}` : ""}
              </li>
            ))}
          </ul>
        </section>
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

      {availableTags.length > 0 && (
        <section className="panel" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontWeight: "500", marginRight: "0.5rem" }}>Tags:</span>
            <button
              type="button"
              className={`filter-btn ${!selectedTag ? "active" : ""}`}
              onClick={() => setSelectedTag(null)}
              style={{ marginRight: "0.5rem" }}
            >
              All
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`filter-btn ${selectedTag === tag ? "active" : ""}`}
                onClick={() => setSelectedTag(tag)}
                style={{
                  background: selectedTag === tag ? "#1976d2" : "#f5f5f5",
                  color: selectedTag === tag ? "white" : "black",
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      )}

      <TaskList
        tasks={visibleTasks}
        loading={loadingTasks}
        onToggle={handleToggleTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onShare={handleShareTask}
      />
    </main>
  );
}
