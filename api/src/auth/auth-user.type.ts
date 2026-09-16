import { PermissionKey, Role } from '@prisma/client';

/** Forma del usuario autenticado, tal como queda en `req.user` tras el JwtAuthGuard. */
export interface AuthUser {
  id: string;
  role: Role;
  tenantId: string | null;
  tenantSlug: string | null;
  permissions: PermissionKey[];
}

/** Payload embebido en el access token (JWT). */
export interface AccessTokenPayload {
  sub: string;
  role: Role;
  tenantId: string | null;
  tenantSlug: string | null;
  permissions: PermissionKey[];
}
