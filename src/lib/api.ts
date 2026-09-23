import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { clearStoredAuth, getStoredToken } from './auth';

const BASE_URL = 'https://dummyjson.com';

/**
 * Centralized Axios instance for DummyJSON API.
 * All API requests across the application must use this single client.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Auth Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized Error Normalization
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    // Ignore cancelled / aborted requests
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    let userFriendlyMessage = 'An unexpected error occurred. Please try again.';

    if (status === 401) {
      userFriendlyMessage = serverMessage || 'Invalid credentials or session expired. Please log in.';
      // Clear invalid session
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        clearStoredAuth();
        window.location.href = '/login?sessionExpired=true';
      }
    } else if (status === 403) {
      userFriendlyMessage = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      userFriendlyMessage = serverMessage || 'The requested resource was not found.';
    } else if (status && status >= 500) {
      userFriendlyMessage = 'Server error. Please try again later.';
    } else if (error.code === 'ECONNABORTED') {
      userFriendlyMessage = 'Request timeout. Please check your internet connection.';
    } else if (!error.response && error.request) {
      userFriendlyMessage = 'Unable to connect to the server. Please check your network connection.';
    } else if (serverMessage) {
      userFriendlyMessage = serverMessage;
    }

    // Attach normalized error message
    const customError = new Error(userFriendlyMessage);
    (customError as any).status = status;
    (customError as any).originalError = error;

    return Promise.reject(customError);
  }
);

export default apiClient;
