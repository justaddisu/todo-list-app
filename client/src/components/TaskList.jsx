import TaskItem from "./TaskItem";

export default function TaskList({ tasks, loading, onToggle, onEdit, onDelete }) {
  if (loading) {
    return (
      <section className="panel">
        <h2>Your tasks</h2>
        <div className="skeleton-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      </section>
    );
  }

  if (!tasks.length) {
    return (
      <section className="panel empty-state">
        <div className="empty-icon">📭</div>
        <h2>No tasks found</h2>
        <p>Add a new task above or adjust your filter.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Your tasks <span className="count-badge">{tasks.length}</span></h2>
      <div className="tasks-grid">
        {tasks.map((task) => (
          <TaskItem
            key={task.id || task._id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
