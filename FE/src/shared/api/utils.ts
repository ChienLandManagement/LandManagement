import type { AxiosError } from 'axios';
import { toast } from 'sonner';

export function extractError(error: AxiosError<{ message?: string }>): string {
  return error.response?.data?.message ?? error.message ?? 'Có lỗi xảy ra';
}

export function showError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
  toast.error(message);
}

export function showSuccess(message: string) {
  toast.success(message);
}
