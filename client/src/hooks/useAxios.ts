import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axiosInstance from "../api/axiosInstance";

interface UseAxiosState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAxiosResponse<T> extends UseAxiosState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  reset: () => void;
}

interface ErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Custom hook for making API requests with Axios
 * @param config Initial Axios request configuration
 * @returns Object containing data, loading state, error, and utility functions
 */
const useAxios = <T>(
  initialConfig?: AxiosRequestConfig
): UseAxiosResponse<T> => {
  const [state, setState] = useState<UseAxiosState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const execute = useCallback(
    async (config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await axiosInstance<T>({
          ...initialConfig,
          ...config,
        });

        setState((prev) => ({
          ...prev,
          data: response.data,
          loading: false,
        }));

        return response;
      } catch (error) {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data as
          | ErrorResponse
          | undefined;

        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          axiosError.message ||
          "An unexpected error occurred";

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        throw axiosError;
      }
    },
    [initialConfig]
  );

  return {
    ...state,
    execute,
    reset,
  };
};

export default useAxios;
