import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/entities/session';
import { useLogout } from '@/features/auth';
import { APP_NAME } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

const ROLE_LABELS: Record<string, string> = {
  Admin: 'Quản trị hệ thống',
  LandOfficer: 'Cán bộ địa chính',
  Leader: 'Lãnh đạo UBND',
  Citizen: 'Người dân',
};

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <>
      <Helmet>
        <title>Trang chủ - {APP_NAME}</title>
      </Helmet>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Xin chào, {user?.fullName}</h1>
        <p className="text-muted-foreground">{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</p>
        <Button variant="outline" onClick={logout}>
          Đăng xuất
        </Button>
      </div>
    </>
  );
}
