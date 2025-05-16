import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import useAuth from "../hooks/useAuth";
import type { User, AuthState } from "../types";

// Extend the auth state with additional context functions
interface AuthContextType extends AuthState {
  login: (credentials: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  updateUserData: (userData: Partial<User>) => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};
