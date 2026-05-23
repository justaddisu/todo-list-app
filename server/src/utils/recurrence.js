/**
 * Generate next recurrence date based on recurrence type
 * @param {string} recurrence - Type of recurrence (daily, weekly, biweekly, monthly)
 * @param {Date} baseDate - The base date to calculate from
 * @returns {Date} Next occurrence date
 */
export function getNextRecurrenceDate(recurrence, baseDate) {
  const date = new Date(baseDate);

  switch (recurrence) {
    case "daily":
      date.setDate(date.getDate() + 1);
      return date;
    case "weekly":
      date.setDate(date.getDate() + 7);
      return date;
    case "biweekly":
      date.setDate(date.getDate() + 14);
      return date;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      return date;
    default:
      return null;
  }
}

/**
 * Check if recurrence should continue based on recurrenceEnd date
 * @param {Date} nextDate - The next scheduled date
 * @param {Date} recurrenceEnd - The recurrence end date
 * @returns {boolean} Whether to create the next occurrence
 */
export function shouldContinueRecurrence(nextDate, recurrenceEnd) {
  if (!recurrenceEnd) return true;
  const endDate = new Date(recurrenceEnd);
  endDate.setHours(23, 59, 59, 999);
  return nextDate <= endDate;
}

/**
 * Generate recurring task instances for a parent task
 * @param {Object} task - The parent task object
 * @returns {Promise<Array>} Array of future task instances to create
 */
export async function generateRecurringInstances(task) {
  if (task.recurrence === "none" || !task.recurrence) {
    return [];
  }

  const instances = [];
  let currentDate = new Date(task.dueDate || new Date());
  const maxInstances = 12; // Limit to prevent infinite loops
  let count = 0;

  while (count < maxInstances && shouldContinueRecurrence(currentDate, task.recurrenceEnd)) {
    const nextDate = getNextRecurrenceDate(task.recurrence, currentDate);
    if (!nextDate) break;

    instances.push({
      title: task.title,
      description: task.description,
      priority: task.priority,
      tags: task.tags,
      owner: task.owner,
      dueDate: nextDate,
      recurrence: "none",
      parentTaskId: task.id,
    });

    currentDate = nextDate;
    count++;
  }

  return instances;
}
