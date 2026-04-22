import axios from 'axios';
import { API_URL } from '@/app/config/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      try {
        await fetch('/api/admin/auth/session', {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch {
        // Ignore cookie cleanup errors and continue with redirect.
      }

      window.location.href = '/admin/login?message=session_expired';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
