import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import { appConfig } from '@/config/app';

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: appConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout.
});

export const _requestSuccessHandler = (config: unknown) => {
  if (
    typeof config === 'object' &&
    config !== null &&
    'method' in config &&
    'url' in config
  ) {
    // Type assertion for logging
    const typedConfig = config as InternalAxiosRequestConfig;
    console.log(
      `Making ${typedConfig.method?.toUpperCase()} request to ${typedConfig.url}`
    );
  }
  return config;
};
export const _requestErrorHandler = (error: unknown) => {
  if (error instanceof Error) {
    console.error('Request error:', error);
  } else {
    console.error('Request error:', String(error));
  }
  return Promise.reject(error);
};
axiosInstance.interceptors.request.use(
  _requestSuccessHandler as (
    value: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
  _requestErrorHandler
);

const handleApiError = (error: unknown): never => {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as AxiosError;
    if (err.response) {
      const errorData: ApiError = {
        error:
          (err.response.data as { error?: string })?.error ||
          `HTTP error! status: ${err.response.status}`,
        message: (err.response.data as { message?: string })?.message,
        status: err.response.status,
      };
      throw new Error(errorData.error);
    }
  }
  if (error && typeof error === 'object' && 'request' in error) {
    throw new Error('Network error - no response received');
  }
  throw new Error((error as Error)?.message || 'Unknown error');
};

const api = {
  get: <T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> => {
    return axiosInstance
      .get(endpoint, { params })
      .then(response => response.data)
      .catch(handleApiError);
  },

  post: <T>(
    endpoint: string,
    data: Record<string, unknown> = {}
  ): Promise<T> => {
    return axiosInstance
      .post(endpoint, data)
      .then(response => response.data)
      .catch(handleApiError);
  },

  put: <T>(
    endpoint: string,
    data: Record<string, unknown> = {}
  ): Promise<T> => {
    return axiosInstance
      .put(endpoint, data)
      .then(response => response.data)
      .catch(handleApiError);
  },

  patch: <T>(
    endpoint: string,
    data: Record<string, unknown> = {}
  ): Promise<T> => {
    return axiosInstance
      .patch(endpoint, data)
      .then(response => response.data)
      .catch(handleApiError);
  },

  delete: <T>(endpoint: string): Promise<T> => {
    return axiosInstance
      .delete(endpoint)
      .then(response => response.data)
      .catch(handleApiError);
  },
};

export default api;
