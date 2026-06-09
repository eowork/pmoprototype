export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  is_superadmin: boolean;
  campus?: string; // Phase Y: Office-scoped visibility
  iat?: number;
  exp?: number;
}
