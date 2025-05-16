import { useState, useEffect, useCallback } from "react";
import type { User, AuthState } from "../types";
import axiosInstance from "../api/axiosInstance";
import { AxiosError } from "axios";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  username?: string;
}

interface ErrorResponse {
  error?: string;
  message?: string;
}

interface AuthFunctions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUserData: (userData: Partial<User>) => void;
}

/**
 * Custom hook for authentication functionality
 * @returns Auth state and functions for login, register, and logout
 */
const useAuth = (): AuthState & AuthFunctions => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    isLoading: true,
    error: null,
  });

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await axiosInstance.get("/users/me");
        setAuthState({
          user: response.data,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch {
        // Clear invalid token
        localStorage.removeItem("token");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Authentication failed. Please log in again.",
        });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      const { user, token } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as ErrorResponse | undefined;

      const errorMessage =
        errorData?.error ||
        errorData?.message ||
        axiosError.message ||
        "Login failed. Please try again.";

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await axiosInstance.post("/users/register", data);
      const { user, token } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as ErrorResponse | undefined;

      const errorMessage =
        errorData?.error ||
        errorData?.message ||
        axiosError.message ||
        "Registration failed. Please try again.";

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Update user data
  const updateUserData = useCallback((userData: Partial<User>) => {
    setAuthState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUserData,
  };
};

export default useAuth;
