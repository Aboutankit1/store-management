import axios from "axios";

const API_URL = import.meta.env.PROD
  ? "https://store-management-rxnw.onrender.com/api"
  : "http://localhost:5005/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("auth");

  if (stored) {
    const { token } = JSON.parse(stored);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;