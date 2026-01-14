import api from "./axios";

export const getTaskLists = (boardId) =>
  api.get(`task-lists/?board=${boardId}`);

export const getTasks = () =>
  api.get("tasks/");

export const moveTask = (taskId, data) =>
  api.patch(`tasks/${taskId}/`, data);
