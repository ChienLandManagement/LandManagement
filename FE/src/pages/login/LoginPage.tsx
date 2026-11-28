import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Eye, EyeOff, Landmark, Loader2, Lock, MapPin, ShieldCheck, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { setAuth } from '@/entities/session';
import { loginApi } from '@/features/auth';
import { APP_NAME, ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z.object({
  userName: z.string().trim().min(1, 'Nhập tên đăng nhập'),
  password: z.string().min(1, 'Nhập mật khẩu'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const { user, accessToken } = await loginApi(values);
      setAuth(user, accessToken);
      navigate({ to: ROUTES.HOME });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <>
      <Helmet>
        <title>Đăng nhập - {APP_NAME}</title>
      </Helmet>
      <div className="grid min-h-screen grid-cols-1 overflow-hidden bg-background text-foreground selection:bg-primary/10 lg:grid-cols-[1.3fr_1fr] 2xl:grid-cols-[1.5fr_1fr]">
        <div className="relative hidden overflow-hidden border-r border-border bg-primary lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1.5px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[
              { left: '12%', size: 'h-3 w-3', opacity: 'bg-primary-foreground/30', duration: 8, delay: 0 },
              { left: '26%', size: 'h-2 w-2', opacity: 'bg-primary-foreground/30', duration: 11, delay: 1.5 },
              { left: '42%', size: 'h-4 w-4', opacity: 'bg-primary-foreground/25', duration: 9, delay: 3 },
              { left: '58%', size: 'h-2.5 w-2.5', opacity: 'bg-primary-foreground/30', duration: 13, delay: 0.8 },
              { left: '74%', size: 'h-3 w-3', opacity: 'bg-primary-foreground/30', duration: 10, delay: 2.2 },
              { left: '88%', size: 'h-3.5 w-3.5', opacity: 'bg-primary-foreground/25', duration: 12, delay: 4 },
            ].map((p) => (
              <motion.span
                key={p.left}
                className={`absolute rounded-full ${p.size} ${p.opacity}`}
                style={{ left: p.left }}
                initial={{ y: '110vh', scale: 0.6, opacity: 0 }}
                animate={{ y: '-10vh', scale: 1, opacity: [0, 1, 0.7, 0] }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between p-16 text-primary-foreground">
            <div>
              <div className="mb-12 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/15 shadow-lg">
                  <Landmark className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">{APP_NAME}</h1>
              </div>

              <h2 className="mb-8 text-4xl leading-[1.15] font-extrabold tracking-tight xl:text-5xl">
                Quản lý đất đai <br />
                <span className="font-medium italic text-primary-foreground/75">minh bạch và đồng bộ.</span>
              </h2>

              <div className="max-w-md space-y-6">
                <div className="group flex items-start gap-4">
                  <div className="rounded-2xl bg-primary-foreground/10 p-3 transition-colors group-hover:bg-primary-foreground/20">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-bold">Kiểm kê &amp; hồ sơ địa chính</h4>
                    <p className="text-sm leading-relaxed text-primary-foreground/75">
                      Theo dõi biến động, danh mục loại đất và số liệu kiểm kê định kỳ cấp xã.
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-4">
                  <div className="rounded-2xl bg-primary-foreground/10 p-3 transition-colors group-hover:bg-primary-foreground/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-bold">Phân quyền chặt chẽ</h4>
                    <p className="text-sm leading-relaxed text-primary-foreground/75">
                      Kiểm soát truy cập theo vai trò cán bộ địa chính, lãnh đạo và quản trị viên.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-primary-foreground/15 pt-6">
              <p className="text-sm font-medium text-primary-foreground/60">
                © {new Date().getFullYear()} {APP_NAME} — Hệ thống quản lý đất đai cấp xã
              </p>
            </div>
          </div>

          <div className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>

        <div className="flex w-full flex-col items-center justify-center bg-background px-6 sm:px-12 lg:px-16 2xl:px-24">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                <Landmark className="h-5 w-5" />
              </div>
              <span className="text-2xl font-black tracking-tight">{APP_NAME}</span>
            </div>

            <Card className="border-border shadow-md">
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-2xl font-bold tracking-tight">Chào mừng trở lại!</CardTitle>
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Link to="/" aria-label="Về trang chủ" title="Về trang chủ">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <CardDescription>Đăng nhập để tiếp tục làm việc</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                  Tên đăng nhập
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="userName"
                    placeholder="Tên đăng nhập"
                    autoComplete="username"
                    autoFocus
                    className="h-11 pl-10"
                    {...register('userName')}
                  />
                </div>
                {errors.userName && <p className="text-xs font-medium text-destructive">{errors.userName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-11 pr-10 pl-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                >
                  {error}
                </div>
              )}

              <Button type="submit" className="h-11 w-full font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
