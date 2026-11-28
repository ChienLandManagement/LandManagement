import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { clearAuth } from '@/entities/session';
import { logoutApi } from '../api/authApi';

export function useLogout() {
  const navigate = useNavigate();

  return useCallback(async () => {
    // Lỗi mạng không được chặn người dùng đăng xuất khỏi phiên trên máy.
    await logoutApi().catch(() => undefined);
    clearAuth();
    navigate({ to: '/' });
  }, [navigate]);
}
