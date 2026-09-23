import apiClient from '@/lib/api';
import { AuthResponse, LoginCredentials, User } from '@/types/auth';

/**
 * Service for handling authentication API operations.
 */
export const authService = {
  /**
   * Log in user with username and password.
   * DummyJSON Endpoint: POST https://dummyjson.com/auth/login
   */
  async loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });
    return response.data;
  },

  /**
   * Get current authenticated user profile using active token.
   * DummyJSON Endpoint: GET https://dummyjson.com/auth/me
   */
  async getCurrentUser(signal?: AbortSignal): Promise<User> {
    const response = await apiClient.get<User>('/auth/me', { signal });
    return response.data;
  },

  /**
   * Refresh authentication token.
   * DummyJSON Endpoint: POST https://dummyjson.com/auth/refresh
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
      expiresInMins: 60,
    });
    return response.data;
  },
};

export default authService;
