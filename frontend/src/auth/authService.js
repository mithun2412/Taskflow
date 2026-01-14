import api from "../api/axios";

// LOGIN (already exists)
export const login = async (username, password) => {
  const res = await api.post("/token/", { username, password });

  localStorage.setItem("access_token", res.data.access);
  localStorage.setItem("refresh_token", res.data.refresh);

  return res.data;
};

// REGISTER (NEW)
export const register = async (username, email, password) => {
  const res = await api.post("/auth/register/", {
    username,
    email,
    password,
  });

  return res.data;
};
