import { useState } from "react";
import ProfileModal from "../ProfileModal";

export default function AdminLayout({ activePage, onNavigate, onExitAdmin, onLogout, user, children }) {
  const [showProfile, setShowProfile] = useState(false);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "tasks", label: "All Tasks", icon: "📋" },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-logo">⚙️</span>
          <div>
            <p className="admin-logo-title">Admin Panel</p>
            <p className="admin-logo-sub">To-Do List App</p>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`admin-nav-item${activePage === key ? " active" : ""}`}
              onClick={() => onNavigate(key)}
            >
              <span className="admin-nav-icon">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-user-info admin-user-info--btn"
            onClick={() => setShowProfile(true)}
            title="Edit your profile"
          >
            <span className="admin-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="admin-user-name">{user?.name}</p>
              <p className="admin-user-email">{user?.email}</p>
            </div>
          </button>
          <div className="admin-footer-actions">
            <button className="admin-exit-btn" onClick={onExitAdmin} title="Back to app">
              Back to App
            </button>
            <button className="admin-logout-btn" onClick={onLogout} title="Logout">
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        {children}
      </main>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
