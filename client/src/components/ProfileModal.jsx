import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

function PasswordInput({ value, onChange, autoComplete, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
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

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password && form.password !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) {
        payload.currentPassword = form.currentPassword;
        payload.password = form.password;
      }
      await updateUser(payload);
      setSuccess("Profile updated successfully!");
      setForm((f) => ({ ...f, currentPassword: "", password: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>My Profile</h3>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <div className="profile-avatar-section">
          <div className="profile-avatar-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-meta">
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email">{user?.email}</p>
            {user?.isAdmin && <span className="role-badge role-admin">admin</span>}
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <p className="modal-error">{error}</p>}
          {success && <p className="modal-success">{success}</p>}

          <fieldset className="profile-fieldset">
            <legend>Account Info</legend>
            <label>
              Name
              <input
                ref={firstRef}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </label>
          </fieldset>

          <fieldset className="profile-fieldset">
            <legend>Change Password (optional)</legend>
            <label>
              Current Password
              <PasswordInput
                value={form.currentPassword}
                onChange={(e) => set("currentPassword", e.target.value)}
                autoComplete="current-password"
                placeholder="Required only if changing password"
              />
            </label>
            <label>
              New Password
              <PasswordInput
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                autoComplete="new-password"
                placeholder="Min 6 characters"
              />
            </label>
            <label>
              Confirm New Password
              <PasswordInput
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
            </label>
          </fieldset>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
