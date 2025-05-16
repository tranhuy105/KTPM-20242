import axiosInstance from "./axiosInstance";
import type { User, ApiResponse } from "../types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

const authApi = {
  /**
   * Login user
   * @param credentials User credentials (email and password)
   * @returns User object and JWT token
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      "/users/login",
      credentials
    );
    return response.data;
  },

  /**
   * Register a new user
   * @param data User registration data
   * @returns User object and JWT token
   */
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
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
    const response = await axiosInstance.get<User>("/users/me");
    return response.data;
  },

  /**
   * Update user password
   * @param userId User ID
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Success message
   */
  updatePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.put<ApiResponse<string>>(
      `/users/${userId}/password`,
      { currentPassword, newPassword }
    );
    return response.data;
  },
};

export default authApi;
