import { useState } from "react";

export default function TaskItem({ task, onToggle, onEdit, onDelete, onShare }) {
  const taskId = task.id || task._id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description || "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    priority: task.priority || "medium",
    tags: task.tags || [],
    recurrence: task.recurrence || "none",
    recurrenceEnd: task.recurrenceEnd ? task.recurrenceEnd.slice(0, 10) : "",
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const onAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !draft.tags.includes(trimmedTag) && draft.tags.length < 10) {
      setDraft((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  const onRemoveTag = (tagToRemove) => {
    setDraft((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    await onEdit(taskId, {
      title: draft.title.trim(),
      description: draft.description,
      dueDate: draft.dueDate || null,
      priority: draft.priority,
      tags: draft.tags,
      recurrence: draft.recurrence,
      recurrenceEnd: draft.recurrence === "none" ? null : draft.recurrenceEnd || null,
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
      tags: task.tags || [],
      recurrence: task.recurrence || "none",
      recurrenceEnd: task.recurrenceEnd ? task.recurrenceEnd.slice(0, 10) : "",
    });
    setTagInput("");
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
        <label>
          Recurrence
          <select name="recurrence" value={draft.recurrence} onChange={onChange}>
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        {draft.recurrence !== "none" && (
          <label>
            Repeat until
            <input
              type="date"
              name="recurrenceEnd"
              value={draft.recurrenceEnd}
              onChange={onChange}
            />
          </label>
        )}
        <label>
          Tags
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), onAddTag())}
              placeholder="Add a tag (press Enter)"
              maxLength={30}
            />
            <button type="button" onClick={onAddTag}>
              Add
            </button>
          </div>
          {draft.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {draft.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "#e3f2fd",
                    color: "#1976d2",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "1rem",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
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
      {task.recurrence && task.recurrence !== "none" && (
        <p className="task-meta-row">
          <span className="priority-badge">Repeats: {task.recurrence}</span>
        </p>
      )}
      {task.tags && task.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
          {task.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "#f3e5f5",
                color: "#7b1fa2",
                padding: "0.25rem 0.75rem",
                borderRadius: "1rem",
                fontSize: "0.85rem",
                fontWeight: "500",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {task.dueDate && (
        <small className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</small>
      )}
      <div className="task-actions">
        <button type="button" className="toggle-btn" onClick={() => onToggle(task)}>
          {task.completed ? "↩ Undo" : "✓ Done"}
        </button>
        <button type="button" className="secondary" onClick={() => onShare?.(task)}>
          Share
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
