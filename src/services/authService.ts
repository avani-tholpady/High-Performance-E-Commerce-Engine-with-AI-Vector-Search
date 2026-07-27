import api from "./api";

export const login = async (email: string, password: string) => {
  return await api.post("/auth/login", {
    email,
    password,
  });
};

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  return await api.post("/auth/register", {
    name,
    email,
    password,
  });
};