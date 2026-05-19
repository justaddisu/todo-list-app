import { http } from "./http";

export const listTasksRequest = async () => {
  const { data } = await http.get("/tasks");
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
