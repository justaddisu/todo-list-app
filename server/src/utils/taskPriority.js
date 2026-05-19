export const TASK_PRIORITIES = ["low", "medium", "high"];

export const normalizePriority = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return TASK_PRIORITIES.includes(normalized) ? normalized : null;
};
