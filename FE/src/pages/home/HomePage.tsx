import { Link } from '@tanstack/react-router';
import { KeyRound, Landmark, LogOut, Users } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/entities/session';
import { ChangePasswordDialog, useLogout } from '@/features/auth';
import { USER_ROLE_LABELS } from '@/features/users';
import { APP_NAME } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const isAdmin = user?.role === 'Admin';
  const roleLabel =
    (user?.role && user.role in USER_ROLE_LABELS
      ? USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS]
      : user?.role) ?? '—';

  return (
    <>
      <Helmet>
        <title>Trang chủ - {APP_NAME}</title>
      </Helmet>

      <div className="min-h-screen bg-muted/30 text-foreground">
        <header className="border-b border-border bg-background">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Landmark className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/users">
                    <Users className="mr-1.5 h-4 w-4" />
                    Quản lý người dùng
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setChangePasswordOpen(true)}>
                <KeyRound className="mr-1.5 h-4 w-4" />
                Đổi mật khẩu
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl">Xin chào, {user?.fullName}</CardTitle>
                  <CardDescription>Hệ thống quản lý đất đai cấp xã</CardDescription>
                </div>
                <Badge variant="secondary">{roleLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tài khoản đăng nhập: <span className="font-medium text-foreground">{user?.userName}</span>
            </CardContent>
          </Card>

          {isAdmin && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-primary" />
                    Quản lý người dùng
                  </CardTitle>
                  <CardDescription>Tạo tài khoản, phân quyền, khóa/mở khóa và đặt lại mật khẩu.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="sm" asChild>
                    <Link to="/users">Mở danh sách</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
}
