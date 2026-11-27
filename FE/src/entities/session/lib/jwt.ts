import { getTokenRoles } from './token';
import { getAccessToken } from '../model/auth.store';

export function hasAnyRole(...roles: string[]): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const userRoles = getTokenRoles(token);
  return roles.some((r) => userRoles.includes(r));
}
