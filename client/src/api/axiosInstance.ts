import axios from "axios";

// Define API base URL based on environment
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

// Create axios instance
const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token");
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjYwOTlhMGM0ZThiZjczY2VjNjcxOCIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGx1eHVyeXN0b3JlLnZuIiwicm9sZSI6ImFkbWluIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzQ3MzkyMjg3LCJleHAiOjE3NDk5ODQyODd9.LLpPUj3iVlWgzlhjtj0VwgRxT74CWLm7oynqGpZkP9M";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Auto logout on 401 (unauthorized) error if it's not a login/register request
    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/register")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
