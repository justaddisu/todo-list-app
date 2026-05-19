import { useEffect, useRef, useState } from "react";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "../../api/adminApi";

const EMPTY_FORM = { name: "", email: "", password: "", confirmPassword: "", role: "user", isAdmin: false };

function PasswordInput({ value, onChange, required, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete || "new-password"}
      />
      <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)} tabIndex={-1} aria-label={show ? "Hide password" : "Show password"}>
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        )}
      </button>
    </div>
  );
}

function UserModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
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

    if (!isEdit && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (isEdit && form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const { confirmPassword: _cp, ...payload } = form;
      if (isEdit && !payload.password) delete payload.password;
      const saved = await (isEdit ? updateAdminUser(initial.id, payload) : createAdminUser(payload));
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
          <h3>{isEdit ? "Edit User" : "Add User"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <p className="modal-error">{error}</p>}
          <label>
            Name
            <input ref={firstRef} value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </label>
          <label>
            Password {isEdit && <span className="hint">(leave blank to keep current)</span>}
            <PasswordInput
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required={!isEdit}
            />
          </label>
          <label>
            Confirm Password {isEdit && <span className="hint">(only if changing password)</span>}
            <PasswordInput
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              required={!isEdit}
              placeholder="Repeat password"
            />
          </label>
          <div className="modal-row">
            <label style={{ flex: 1 }}>
              Role
              <select value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <label className="modal-check">
              <input
                type="checkbox"
                checked={form.isAdmin}
                onChange={(e) => set("isAdmin", e.target.checked)}
              />
              Admin privileges
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode:"add"|"edit", user?:{} }

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user and all their tasks?")) return;
    setDeleting(id);
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(null);
    }
  };

  const handleSave = (saved, isEdit) => {
    setUsers((prev) =>
      isEdit ? prev.map((u) => (u.id === saved.id ? saved : u)) : [saved, ...prev]
    );
    setModal(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Users</h2>
          <p className="admin-page-sub">Manage all registered accounts.</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({ mode: "add" })}>
          + Add User
        </button>
      </div>

      {error && <p className="toast toast--error">{error}</p>}

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
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span className="tbl-avatar">{u.name.charAt(0).toUpperCase()}</span>
                    {u.name}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.isAdmin ? "role-admin" : "role-user"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="tbl-actions">
                    <button
                      className="tbl-btn tbl-btn--edit"
                      onClick={() => setModal({ mode: "edit", user: { ...u, password: "" } })}
                    >
                      Edit
                    </button>
                    <button
                      className="danger tbl-btn"
                      disabled={u.id === currentUserId || deleting === u.id}
                      onClick={() => handleDelete(u.id)}
                    >
                      {deleting === u.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="empty-state">
              <p className="empty-icon">👤</p>
              <h2>No users found</h2>
            </div>
          )}
        </div>
      )}

      {modal && (
        <UserModal
          initial={modal.mode === "edit" ? modal.user : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

