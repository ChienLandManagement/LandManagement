import { Link } from '@tanstack/react-router';
import { ArrowRight, BarChart3, CheckCircle2, FileSpreadsheet, Landmark, Layers, MapPin, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '@/entities/session';
import { APP_NAME, ROUTES } from '@/shared/config/constants';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

const FEATURES = [
  {
    icon: Layers,
    title: 'Danh mục & Thửa đất',
    description: 'Quản lý cây 67 loại đất, 18 nhóm đối tượng sử dụng và thông tin thửa đất đồng bộ.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Kiểm kê định kỳ',
    description: 'Nhập và đối chiếu số liệu biểu B01, B02, B04, B05 nhanh chóng với sai số kiểm soát chặt chẽ.',
  },
  {
    icon: BarChart3,
    title: 'Báo cáo trực quan',
    description: 'Theo dõi cơ cấu sử dụng đất và biến động giữa các kỳ kiểm kê theo thời gian thực.',
  },
  {
    icon: ShieldCheck,
    title: 'Phân quyền & Bảo mật',
    description: 'Kiểm soát truy cập theo vai trò Quản trị viên, Cán bộ địa chính, Lãnh đạo và Người dân.',
  },
];

const STATS = [
  { label: 'Loại đất chuẩn hóa', value: '67+' },
  { label: 'Biểu mẫu kiểm kê', value: 'B01–B05' },
  { label: 'Độ chính xác', value: '0.005 ha' },
];

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken));

  return (
    <>
      <Helmet>
        <title>{APP_NAME} — Hệ thống quản lý đất đai cấp xã</title>
      </Helmet>

      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Landmark className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
            </div>

            <Button asChild size="sm">
              <Link to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN}>
                {isAuthenticated ? 'Vào hệ thống' : 'Đăng nhập'}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-border py-16 sm:py-24">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
            />
            <motion.div
              aria-hidden
              animate={{ scale: [1.1, 0.95, 1.1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              className="pointer-events-none absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
            />

            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45 }}
                className="space-y-6 text-center lg:text-left"
              >
                <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
                  Chuyển đổi số địa chính cấp xã
                </Badge>

                <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Quản lý đất đai <span className="text-primary">minh bạch &amp; chính xác</span>
                </h1>

                <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                  Nền tảng số hóa công tác kiểm kê đất đai, quản lý hồ sơ địa chính và theo dõi biến động phục vụ
                  UBND cấp xã.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 lg:justify-start">
                  <Button size="lg" asChild>
                    <Link to={isAuthenticated ? ROUTES.HOME : ROUTES.LOGIN}>
                      {isAuthenticated ? 'Vào bảng điều khiển' : 'Đăng nhập ngay'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-black text-primary">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="flex justify-center" style={{ perspective: 1200 }}>
                <motion.div
                  initial={{ opacity: 0, rotateY: -18, rotateX: 12, scale: 0.92 }}
                  animate={{ opacity: 1, rotateY: -10, rotateX: 6, scale: 1 }}
                  whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="w-full max-w-md"
                >
                  <Card className="border-border bg-card/95 shadow-2xl backdrop-blur">
                    <CardHeader className="border-b border-border pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm font-bold">Tổng quan Kỳ kiểm kê 2026</CardTitle>
                        </div>
                        <Badge>Đang hoạt động</Badge>
                      </div>
                      <CardDescription className="text-xs">Số liệu đồng bộ toàn xã theo thời gian thực</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-border bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Đất nông nghiệp</p>
                          <p className="mt-1 text-xl font-bold text-primary">1,245.80 ha</p>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Đất phi nông nghiệp</p>
                          <p className="mt-1 text-xl font-bold">412.35 ha</p>
                        </div>
                      </div>
                      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            Đối chiếu biểu B01 – B05
                          </span>
                          <span className="font-semibold text-primary">Khớp 100%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="h-full rounded-full bg-primary"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Tính năng trọng tâm</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thiết kế tối ưu cho quy trình nghiệp vụ địa chính tại địa phương
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: 1000 }}>
              {FEATURES.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Card className="h-full border-border transition-shadow hover:shadow-xl">
                    <CardHeader className="space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME} — Hệ thống quản lý đất đai cấp xã
        </footer>
      </div>
    </>
  );
}
