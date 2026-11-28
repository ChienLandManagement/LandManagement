import { login, logout, refreshToken } from '@/shared/api/generated/api';
import type { LoginRequest, LoginResponse, UserProfile } from '@/shared/api/model';

export type { LoginRequest, LoginResponse, UserProfile };
export type UserRole = 'Admin' | 'LandOfficer' | 'Leader' | 'Citizen';

// Login/refresh là endpoint công khai: không gắn token, lỗi do màn tự hiển thị.
const publicRequest = { skipAuth: true, skipGlobalError: true } as const;

export interface AuthSession {
  accessToken: string;
  user: { id: string; userName: string; fullName: string; email: string | null; role: UserRole };
}

// Swagger đánh dấu mọi trường là tùy chọn nên kiểm lại trước khi dùng làm phiên.
function toSession(data: LoginResponse | null | undefined, fallback: string): AuthSession {
  const user = data?.user;
  if (!data?.accessToken || !user?.id || !user.userName || !user.fullName || !user.role) throw new Error(fallback);
  return {
    accessToken: data.accessToken,
    user: {
      id: user.id,
      userName: user.userName,
      fullName: user.fullName,
      email: user.email ?? null,
      role: user.role as UserRole,
    },
  };
}

export const loginApi = async (body: LoginRequest) =>
  toSession((await login(body, publicRequest)).data, 'Đăng nhập thất bại');

export const refreshTokenApi = async () =>
  toSession((await refreshToken(publicRequest)).data, 'Phiên đăng nhập đã hết hạn');

export const logoutApi = () => logout(publicRequest);
