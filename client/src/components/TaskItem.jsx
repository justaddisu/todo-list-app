import { useState } from "react";

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const taskId = task.id || task._id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description || "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    priority: task.priority || "medium",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    await onEdit(taskId, {
      title: draft.title.trim(),
      description: draft.description,
      dueDate: draft.dueDate || null,
      priority: draft.priority,
    });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      priority: task.priority || "medium",
    });
    setEditing(false);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  if (editing) {
    return (
      <article className="task-card editing">
        <label>
          Title
          <input name="title" value={draft.title} onChange={onChange} maxLength={140} required />
        </label>
        <label>
          Description
          <textarea name="description" value={draft.description} onChange={onChange} rows={2} maxLength={1000} />
        </label>
        <label>
          Due date
          <input type="date" name="dueDate" value={draft.dueDate} onChange={onChange} />
        </label>
        <label>
          Priority
          <select name="priority" value={draft.priority} onChange={onChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <div className="task-actions">
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" className="secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={`task-card ${task.completed ? "done" : ""}`}>
      <header>
        <h3 className={task.completed ? "strikethrough" : ""}>{task.title}</h3>
        <span className="task-date">{new Date(task.createdAt).toLocaleDateString()}</span>
      </header>
      {task.description && <p className="task-desc">{task.description}</p>}
      <p className="task-meta-row">
        <span className={`priority-badge priority-${task.priority || "medium"}`}>
          Priority: {task.priority || "medium"}
        </span>
      </p>
      {task.dueDate && (
        <small className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</small>
      )}
      <div className="task-actions">
        <button type="button" className="toggle-btn" onClick={() => onToggle(task)}>
          {task.completed ? "↩ Undo" : "✓ Done"}
        </button>
        <button type="button" className="edit-btn" onClick={() => setEditing(true)}>
          ✏ Edit
        </button>
        <button type="button" className="danger" onClick={() => onDelete(taskId)}>
          🗑 Delete
        </button>
      </div>
    </article>
  );
}
