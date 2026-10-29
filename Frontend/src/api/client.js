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

// Local dev talks to the backend on port 5000. A production build calls /api on its own domain,
// and vercel.json forwards those requests to the hosted backend, so no build-time variable is needed.
// VITE_API_URL, when set, still overrides both.
const DEFAULT_API_URL = import.meta.env.PROD ? "/api" : "http://localhost:5000/api";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || DEFAULT_API_URL });

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
