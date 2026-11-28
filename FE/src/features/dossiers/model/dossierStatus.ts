import { DossierStatus } from '@/shared/api/model';

export const DOSSIER_STATUS_LABELS: Record<DossierStatus, string> = {
  [DossierStatus.Processing]: 'Đang xử lý',
  [DossierStatus.Backlog]: 'Hồ sơ tồn',
  [DossierStatus.Issued]: 'Đã cấp GCN',
  [DossierStatus.Rejected]: 'Từ chối',
  [DossierStatus.NeedSupplement]: 'Cần bổ sung',
};

export const DOSSIER_STATUS_COLORS: Record<DossierStatus, string> = {
  [DossierStatus.Processing]: 'blue',
  [DossierStatus.Backlog]: 'orange',
  [DossierStatus.Issued]: 'teal',
  [DossierStatus.Rejected]: 'red',
  [DossierStatus.NeedSupplement]: 'yellow',
};

export const DOSSIER_STATUS_OPTIONS = Object.entries(DOSSIER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

/** Trạng thái đã có kết quả: chỉ lúc này mới có ngày có kết quả. */
export const isResolvedStatus = (status?: string | null) =>
  status === DossierStatus.Issued || status === DossierStatus.Rejected;
