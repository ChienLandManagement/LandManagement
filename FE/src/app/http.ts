import { clearAuth, getAccessToken, setAuth } from '@/entities/session';
import { refreshTokenApi } from '@/features/auth';
import { configureHttpAuth } from '@/shared/api/http';
import { ROUTES } from '@/shared/config/constants';

// Nối lớp HTTP (shared) với phiên đăng nhập: shared không biết store hay endpoint refresh.
configureHttpAuth({
  getToken: getAccessToken,
  refresh: async () => {
    try {
      const { user, accessToken } = await refreshTokenApi();
      setAuth(user, accessToken);
      return accessToken;
    } catch (error) {
      clearAuth();
      window.location.assign(ROUTES.LOGIN);
      throw error;
    }
  },
});
