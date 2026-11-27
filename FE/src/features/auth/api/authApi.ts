import { publicClient } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}

export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  const res = await publicClient.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
  if (res.data.isError) throw new Error(res.data.message ?? 'Đăng nhập thất bại');
  return res.data.object!;
}

export async function refreshTokenApi(refreshToken: string): Promise<LoginResponse> {
  const res = await publicClient.post<ApiResponse<LoginResponse>>('/api/auth/refresh', { refreshToken });
  if (res.data.isError) throw new Error(res.data.message ?? 'Refresh token thất bại');
  return res.data.object!;
}
