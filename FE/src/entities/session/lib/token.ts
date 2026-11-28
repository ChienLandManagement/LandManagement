import { jwtDecode } from 'jwt-decode';

interface JwtClaims {
  sub: string;
  email: string;
  name: string;
  role?: string | string[];
  ward_id?: string | string[];
  exp: number;
}

export function decodeToken(token: string): JwtClaims | null {
  try {
    return jwtDecode<JwtClaims>(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const claims = decodeToken(token);
  if (!claims) return true;
  return claims.exp * 1000 < Date.now();
}

export function getTokenRoles(token: string): string[] {
  const claims = decodeToken(token);
  if (!claims) return [];
  const roles = claims.role;
  if (Array.isArray(roles)) return roles;
  if (typeof roles === 'string') return [roles];
  return [];
}
