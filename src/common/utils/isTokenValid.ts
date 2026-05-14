import { jwtDecode } from 'jwt-decode';

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp !== undefined && decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};
