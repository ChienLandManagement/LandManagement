import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { clearAuth } from '@/entities/session';

export function useLogout() {
  const navigate = useNavigate();

  return useCallback(() => {
    clearAuth();
    navigate({ to: '/login' });
  }, [navigate]);
}
