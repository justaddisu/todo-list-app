import { useState } from "react";

const initialTask = {
  title: "",
  description: "",
  dueDate: "",
  priority: "medium",
};

export default function TaskForm({ onCreate, loading }) {
  const [task, setTask] = useState(initialTask);

  const onChange = (event) => {
    const { name, value } = event.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await onCreate(task);
    setTask(initialTask);
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
      <button disabled={loading} type="submit">
        {loading ? "Adding..." : "Add task"}
      </button>
    </form>
  );
}
