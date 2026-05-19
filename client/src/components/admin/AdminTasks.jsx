import { useEffect, useRef, useState } from "react";
import {
  createAdminTask,
  deleteAdminTask,
  getAdminTasks,
  getAdminUsers,
  updateAdminTask,
} from "../../api/adminApi";

const EMPTY_TASK = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  completed: false,
  owner: "",
};

function TaskModal({ initial, users, onClose, onSave }) {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : "",
          owner: initial.owner || initial.User?.id || "",
        }
      : EMPTY_TASK
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial?.id;
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        completed: form.completed === true || form.completed === "true",
        dueDate: form.dueDate || null,
      };
      const saved = await (isEdit ? updateAdminTask(initial.id, payload) : createAdminTask(payload));
      onSave(saved, isEdit);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? "Edit Task" : "Add Task"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <p className="modal-error">{error}</p>}
          <label>
            Title
            <input ref={firstRef} value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
          <div className="modal-row">
            <label style={{ flex: 1 }}>
              Priority
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label style={{ flex: 1 }}>
              Due Date
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            </label>
          </div>
          <label>
            Owner
            <select value={form.owner} onChange={(e) => set("owner", e.target.value)} required>
              <option value="">— Select user —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </label>
          <label className="modal-check">
            <input
              type="checkbox"
              checked={form.completed === true}
              onChange={(e) => set("completed", e.target.checked)}
            />
            Mark as completed
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    Promise.all([getAdminTasks(), getAdminUsers()])
      .then(([t, u]) => { setTasks(t); setUsers(u); })
      .catch((err) => setError(err.response?.data?.message || "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this task?")) return;
    setDeleting(id);
    try {
      await deleteAdminTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = (saved, isEdit) => {
    setTasks((prev) =>
      isEdit ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev]
    );
    setModal(null);
  };

  const visible = tasks.filter((t) => {
    const q = search.trim().toLowerCase();
    return !q || t.title.toLowerCase().includes(q) || t.User?.email?.toLowerCase().includes(q);
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">All Tasks</h2>
          <p className="admin-page-sub">View and manage tasks across all users.</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ mode: "add" })}>
          + Add Task
        </button>
      </div>

      {error && <p className="toast toast--error">{error}</p>}

      <div className="admin-toolbar">
        <input
          className="search-input"
          placeholder="Search by title or owner email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="count-badge">{visible.length}</span>
      </div>

      {loading ? (
        <div className="admin-table-wrap">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card" style={{ height: 48, marginBottom: 8 }} />
          ))}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td className={t.completed ? "strikethrough" : ""}>{t.title}</td>
                  <td>{t.User?.email ?? "—"}</td>
                  <td>
                    <span className={`priority-badge priority-${t.priority || "medium"}`}>
                      {t.priority || "medium"}
                    </span>
                  </td>
                  <td>
                    <span className={`role-badge ${t.completed ? "role-admin" : "role-user"}`}>
                      {t.completed ? "Done" : "Active"}
                    </span>
                  </td>
                  <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="tbl-actions">
                    <button
                      className="tbl-btn tbl-btn--edit"
                      onClick={() => setModal({ mode: "edit", task: t })}
                    >
                      Edit
                    </button>
                    <button
                      className="danger tbl-btn"
                      disabled={deleting === t.id}
                      onClick={() => handleDelete(t.id)}
                    >
                      {deleting === t.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <h2>No tasks found</h2>
            </div>
          )}
        </div>
      )}

      {modal && (
        <TaskModal
          initial={modal.mode === "edit" ? modal.task : null}
          users={users}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

