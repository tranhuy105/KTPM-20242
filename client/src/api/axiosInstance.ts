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
    // Check both localStorage and sessionStorage for token
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("request to " + config.url);
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
      localStorage.removeItem("userEmail");
      sessionStorage.removeItem("token");
      window.location.href = "/auth";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
