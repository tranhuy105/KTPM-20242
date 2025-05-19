import axiosInstance from "./axiosInstance";
import type { User, UserFilters } from "../types";
import type { PaginatedUserResponse } from "../types/Api";

const userApi = {
  /**
   * Get all users (with pagination and filtering)
   * @param filters Optional filters to apply
   * @returns Paginated list of users
   */
  getAllUsers: async (
    filters?: UserFilters
  ): Promise<PaginatedUserResponse> => {
    const response = await axiosInstance.get<PaginatedUserResponse>("/users", {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get a user by ID
   * @param userId User ID
   * @returns User object
   */
  getUserById: async (userId: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Create a new user (admin only)
   * @param userData User data
   * @returns Created user
   */
  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await axiosInstance.post<User>("/users", userData);
    return response.data;
  },

  /**
   * Update a user
   * @param userId User ID
   * @param userData Updated user data
   * @returns Updated user object
   */
  updateUser: async (
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
   * Delete a user
   * @param userId User ID
   * @returns Success message
   */
  deleteUser: async (userId: string): Promise<string> => {
    const response = await axiosInstance.delete<string>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Change user role (admin only)
   * @param userId User ID
   * @param role New role
   * @returns Updated user
   */
  changeUserRole: async (
    userId: string,
    role: "customer" | "admin" | "manager"
  ): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${userId}/role`, {
      role,
    });
    return response.data;
  },

  /**
   * Toggle user active status (admin only)
   * @param userId User ID
   * @param isActive Active status
   * @returns Updated user
   */
  toggleUserActive: async (
    userId: string,
    isActive: boolean
  ): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  },
};

export default userApi;
