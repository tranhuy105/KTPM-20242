import axiosInstance from "./axiosInstance";
import type { User } from "../types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Authentication API service
 */
const authApi = {
  /**
   * Login user
   * @param credentials User credentials
   * @returns Auth response with user and token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/users/login",
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   * @param data User registration data
   * @returns Auth response with user and token
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/users/register",
      data
    );
    return response.data;
  },

  /**
   * Get current user profile
   * @returns User object
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>("/users/profile");
    console.log("response.data", response.data);
    return response.data;
  },

  /**
   * Update user profile
   * @param userData Partial user data to update
   * @returns Updated user object
   */
  updateProfile: async (
    userId: string,
    userData: Partial<User>
  ): Promise<User> => {
    const response = await axiosInstance.put<User>(
      `/users/${userId}`,
      userData
    );
    return response.data;
  },

  /**
   * Change password
   * @param data Password change data
   * @returns Success message
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(
      "/users/change-password",
      data
    );
    return response.data;
  },

  // Forgot password request
  forgotPassword: async (email: string) => {
    try {
      const response = await axiosInstance.post(`/auth/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await axiosInstance.post(`/auth/reset-password`, {
        token,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};

export default authApi;
