import { http } from "./http";

export const listTasksRequest = async (tag = null) => {
  const params = tag ? { tag } : {};
  const { data } = await http.get("/tasks", { params });
  return data;
};

export const createTaskRequest = async (payload) => {
  const { data } = await http.post("/tasks", payload);
  return data;
};

export const updateTaskRequest = async (id, payload) => {
  const { data } = await http.put(`/tasks/${id}`, payload);
  return data;
};

export const deleteTaskRequest = async (id) => {
  const { data } = await http.delete(`/tasks/${id}`);
  return data;
};

export const getTagsRequest = async () => {
  const { data } = await http.get("/tasks/tags/all");
  return data;
};

export const getTasksByTagRequest = async (tag) => {
  const { data } = await http.get("/tasks/tags/filter", { params: { tag } });
  return data;
};

export const getUpcomingRemindersRequest = async () => {
  const { data } = await http.get("/tasks/reminders/upcoming");
  return data;
};

export const shareTaskRequest = async (id, payload) => {
  const { data } = await http.post(`/tasks/${id}/share`, payload);
  return data;
};

export const unshareTaskRequest = async (id, userId) => {
  const { data } = await http.delete(`/tasks/${id}/share/${userId}`);
  return data;
};
