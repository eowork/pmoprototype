export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  is_superadmin: boolean;
  iat?: number;
  exp?: number;
}
