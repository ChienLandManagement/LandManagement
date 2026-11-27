import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '@/shared/config/constants';

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>Đăng nhập - {APP_NAME}</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-center text-2xl font-bold">Đăng nhập</h1>
        </div>
      </div>
    </>
  );
}
