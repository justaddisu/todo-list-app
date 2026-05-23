import { useState } from "react";

const initialTask = {
  title: "",
  description: "",
  dueDate: "",
  priority: "medium",
  tags: [],
  recurrence: "none",
  recurrenceEnd: "",
  reminderMinutes: [],
};

export default function TaskForm({ onCreate, loading }) {
  const [task, setTask] = useState(initialTask);
  const [tagInput, setTagInput] = useState("");
  const [reminderInput, setReminderInput] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const onAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !task.tags.includes(trimmedTag) && task.tags.length < 10) {
      setTask((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  const onRemoveTag = (tagToRemove) => {
    setTask((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...task,
      recurrenceEnd: task.recurrence === "none" ? null : task.recurrenceEnd || null,
      reminderMinutes: reminderInput
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value >= 0),
    };
    await onCreate(payload);
    setTask(initialTask);
    setReminderInput("");
  };

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h2>New task</h2>
      <label>
        Title
        <input
          name="title"
          value={task.title}
          onChange={onChange}
          required
          maxLength={140}
          placeholder="Finish API docs"
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={task.description}
          onChange={onChange}
          rows={3}
          maxLength={1000}
          placeholder="Optional details"
        />
      </label>
      <label>
        Due date
        <input
          type="date"
          name="dueDate"
          value={task.dueDate}
          onChange={onChange}
        />
      </label>
      <label>
        Priority
        <select name="priority" value={task.priority} onChange={onChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label>
        Recurrence
        <select name="recurrence" value={task.recurrence} onChange={onChange}>
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>
      {task.recurrence !== "none" && (
        <label>
          Repeat until
          <input
            type="date"
            name="recurrenceEnd"
            value={task.recurrenceEnd}
            onChange={onChange}
          />
        </label>
      )}
      <label>
        Reminders (minutes before due date)
        <input
          value={reminderInput}
          onChange={(e) => setReminderInput(e.target.value)}
          placeholder="e.g. 15,60,1440"
        />
      </label>
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
        {task.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {task.tags.map((tag) => (
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
      <button disabled={loading} type="submit">
        {loading ? "Adding..." : "Add task"}
      </button>
    </form>
  );
}
