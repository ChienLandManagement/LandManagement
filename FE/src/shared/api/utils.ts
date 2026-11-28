import type { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';

export function extractError(error: AxiosError<{ message?: string }>): string {
  return error.response?.data?.message ?? error.message ?? 'Có lỗi xảy ra';
}

export function showError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
  notifications.show({ message, color: 'red' });
}

export function showSuccess(message: string) {
  notifications.show({ message, color: 'teal' });
}
