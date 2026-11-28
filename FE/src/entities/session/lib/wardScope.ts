import { getAccessToken, getUser } from '../model/auth.store';
import { decodeToken } from './token';

export interface WardScope {
  /** Admin thấy mọi xã; người khác chỉ các xã được phân công. */
  isAdmin: boolean;
  wardIds: string[];
  /** Cần chọn xã khi tạo mới / lọc: Admin hoặc người được phân công từ hai xã trở lên. */
  canPickWard: boolean;
}

export function getWardScope(): WardScope {
  const isAdmin = getUser()?.role === 'Admin';
  const token = getAccessToken();
  const claim = (token ? decodeToken(token) : null)?.ward_id;
  const wardIds = Array.isArray(claim) ? claim : claim ? [claim] : [];
  return { isAdmin, wardIds, canPickWard: isAdmin || wardIds.length > 1 };
}
