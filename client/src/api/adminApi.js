import { http } from "./http";

export const getAdminStats = async () => {
  const { data } = await http.get("/admin/stats");
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await http.get("/admin/users");
  return data;
};

export const createAdminUser = async (payload) => {
  const { data } = await http.post("/admin/users", payload);
  return data;
};

export const updateAdminUser = async (id, payload) => {
  const { data } = await http.put(`/admin/users/${id}`, payload);
  return data;
};

export const deleteAdminUser = async (id) => {
  const { data } = await http.delete(`/admin/users/${id}`);
  return data;
};

export const getAdminTasks = async () => {
  const { data } = await http.get("/admin/tasks");
  return data;
};

export const createAdminTask = async (payload) => {
  const { data } = await http.post("/admin/tasks", payload);
  return data;
};

export const updateAdminTask = async (id, payload) => {
  const { data } = await http.put(`/admin/tasks/${id}`, payload);
  return data;
};

export const deleteAdminTask = async (id) => {
  const { data } = await http.delete(`/admin/tasks/${id}`);
  return data;
};
