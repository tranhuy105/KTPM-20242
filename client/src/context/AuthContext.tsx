import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, AuthState } from "../types";
import authApi from "../api/authApi";
import i18n from "i18next";

// Interface for login credentials
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Interface for registration data
interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Extend the auth state with additional context functions
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUserData: (userData: Partial<User>) => Promise<User>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("token") || sessionStorage.getItem("token"),
    isAuthenticated: !!(
      localStorage.getItem("token") || sessionStorage.getItem("token")
    ),
    isLoading: true,
    error: null,
  });

  // Apply user preferences when user data changes
  const applyUserPreferences = (user: User) => {
    if (user?.preferences) {
      // Apply language preference
      if (user.preferences.language) {
        if (i18n && i18n.language !== user.preferences.language) {
          i18n.changeLanguage(user.preferences.language);
        }
      }

      // Store user data in localStorage for currency preferences
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.error("Error storing user data in localStorage:", e);
      }
    }
  };

  // Load user data if token exists - only once on initial mount
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

        ensureUserConsistency(userData);

        // Apply user preferences when loading user data
        applyUserPreferences(userData);

        setAuthState({
          user: userData,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
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

    // Only load user if we're in the initial loading state
    if (authState.isLoading && authState.token) {
      loadUser();
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [authState.token, authState.isLoading]);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user, token } = await authApi.login(credentials);

      ensureUserConsistency(user);

      // Store token based on rememberMe preference
      if (credentials.rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", credentials.email);
      } else {
        sessionStorage.setItem("token", token);
        localStorage.removeItem("userEmail");
      }

      // Apply user preferences immediately after login
      applyUserPreferences(user);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user, token } = await authApi.register(data);

      ensureUserConsistency(user);

      // Save token to localStorage
      localStorage.setItem("token", token);

      // Apply user preferences immediately after registration
      applyUserPreferences(user);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
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
  };

  // Update user data
  const updateUserData = async (userData: Partial<User>): Promise<User> => {
    try {
      // dit me cai ham nay cay vl
      // cha biet co can phan post len endpoint khong?
      console.log("updateUserData", userData);

      // make sure dont update id and _id and other properties
      let updatedUser = {
        ...authState.user,
        id: authState.user?.id,
        _id: authState.user?._id,
        ...userData,
      } as User;

      if (userData._id || userData.id) {
        const result = await authApi.updateProfile(
          updatedUser._id,
          updatedUser
        );
        console.log(result);
        updatedUser = result;
      }

      // Apply user preferences when updating user data
      applyUserPreferences(updatedUser);

      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));

      return updatedUser;
    } catch (error) {
      console.error("Failed to update user data:", error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

// Khong hieu dang lam gi voi cuoc doi
function ensureUserConsistency(user: User) {
  if (user._id && !user.id) {
    user.id = user._id;
  } else if (user.id && !user._id) {
    user._id = user.id;
  }
}
