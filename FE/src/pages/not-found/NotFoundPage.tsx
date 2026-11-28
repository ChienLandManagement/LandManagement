import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileQuestion, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME, ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - {APP_NAME}</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-muted/60 text-primary shadow-sm"
          >
            <FileQuestion className="h-10 w-10" />
          </motion.div>

          <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Lỗi 404</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Trang không tồn tại</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại địa chỉ.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button onClick={() => navigate({ to: ROUTES.HOME })}>
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
