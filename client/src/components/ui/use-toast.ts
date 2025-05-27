// Adapted from shadcn/ui toast component
import { createContext, useContext } from "react";

type ToastType = "default" | "destructive" | "success";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    // For this simplified version, we'll create a mock implementation
    // when the context isn't available
    return {
      toast: (props: Omit<Toast, "id">) => {
        console.log("Toast:", props);
      },
    };
  }

  return {
    toast: (props: Omit<Toast, "id">) => {
      context.addToast(props);
    },
  };
};

export default useToast;
