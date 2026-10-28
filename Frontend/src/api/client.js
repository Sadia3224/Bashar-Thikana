import axios from "axios";

export const TOKEN_KEY = "bashar_thikana_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable: the session lasts until the page is closed.
  }
};

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Rethrow every failure as an Error whose message is the API's `{ message }`, so forms can show it as is.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || (error.response ? error.message : "Cannot reach the server. Is the backend running?");
    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  }
);

export default api;
