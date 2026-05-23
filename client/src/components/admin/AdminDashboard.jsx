import { useEffect, useState } from "react";
import { getAdminActivityLogs, getAdminAnalytics, getAdminStats } from "../../api/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminAnalytics(), getAdminActivityLogs()])
      .then(([statsData, analyticsData, logsData]) => {
        setStats(statsData);
        setAnalytics(analyticsData);
        setLogs(Array.isArray(logsData) ? logsData : []);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Dashboard</h2>
        <div className="admin-stats-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-card" style={{ height: 100 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <p className="toast toast--error">{error}</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#3b82f6" },
    { label: "Total Tasks", value: stats.totalTasks, icon: "📋", color: "#8b5cf6" },
    { label: "Completed", value: stats.completedTasks, icon: "✅", color: "#10b981" },
    { label: "Pending", value: stats.pendingTasks, icon: "⏳", color: "#f59e0b" },
  ];

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Dashboard</h2>
      <p className="admin-page-sub">Overview of your application activity.</p>

      <div className="admin-stats-grid">
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card" style={{ "--stat-color": color }}>
            <div className="stat-card-icon">{icon}</div>
            <div>
              <p className="stat-card-value">{value}</p>
              <p className="stat-card-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {analytics && (
        <section className="panel" style={{ marginTop: "1rem" }}>
          <h3>Analytics</h3>
          <p>Completion rate: <strong>{analytics.completionRate}%</strong></p>
          <p>Overdue tasks: <strong>{analytics.overdueTasks}</strong></p>
        </section>
      )}

      <section className="panel" style={{ marginTop: "1rem" }}>
        <h3>Recent activity</h3>
        {logs.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "1rem" }}>
            {logs.slice(0, 8).map((log) => (
              <li key={log.id}>
                {log.action} {log.entityType} at {new Date(log.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
