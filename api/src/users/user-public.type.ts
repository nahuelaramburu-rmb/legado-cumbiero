import { PermissionKey, Role, User } from '@prisma/client';

/** Forma segura de un User para devolver por API — nunca incluye passwordHash. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string | null;
  tenantSlug: string | null;
  permissions: PermissionKey[];
  isActive: boolean;
  createdAt: Date;
}

export function toPublicUser(user: User, tenantSlug: string | null, permissions: PermissionKey[] = []): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug,
    permissions,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
