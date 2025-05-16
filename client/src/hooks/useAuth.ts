import { useState, useEffect, useCallback } from "react";
import type { User, AuthState } from "../types";
import authApi from "../api/authApi";
import { AxiosError } from "axios";

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
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
    token: localStorage.getItem("token") || sessionStorage.getItem("token"),
    isAuthenticated: !!(
      localStorage.getItem("token") || sessionStorage.getItem("token")
    ),
    isLoading: true,
    error: null,
  });

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();

        // Ensure the user object has both _id and id properties
        if (userData._id && !userData.id) {
          userData.id = userData._id;
        } else if (userData.id && !userData._id) {
          userData._id = userData.id;
        }

        setAuthState({
          user: userData,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch {
        // Clear invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        sessionStorage.removeItem("token");
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
      const { user, token } = await authApi.login(credentials);

      // Ensure the user object has both _id and id properties
      if (user._id && !user.id) {
        user.id = user._id;
      } else if (user.id && !user._id) {
        user._id = user.id;
      }

      // Always store token in both storages to prevent loss during refresh
      // This ensures token is available regardless of which storage mechanism is checked first
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);

      // Store email only if remember me is enabled
      if (credentials.rememberMe) {
        localStorage.setItem("userEmail", credentials.email);
      } else {
        localStorage.removeItem("userEmail");
      }

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
      const { user, token } = await authApi.register(data);

      // Ensure the user object has both _id and id properties
      if (user._id && !user.id) {
        user.id = user._id;
      } else if (user.id && !user._id) {
        user._id = user.id;
      }

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
    localStorage.removeItem("userEmail");
    sessionStorage.removeItem("token");
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Update user data
  const updateUserData = useCallback(async (userData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(userData);

      // Ensure the user object has both _id and id properties
      if (updatedUser._id && !updatedUser.id) {
        updatedUser.id = updatedUser._id;
      } else if (updatedUser.id && !updatedUser._id) {
        updatedUser._id = updatedUser.id;
      }

      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      return updatedUser;
    } catch (error) {
      console.error("Failed to update user data:", error);
      throw error;
    }
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
