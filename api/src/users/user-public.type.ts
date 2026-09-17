import { PermissionKey, Role, User } from '@prisma/client';

/** Forma segura de un User para devolver por API — nunca incluye passwordHash. */
export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  tenantId: string | null;
  tenantSlug: string | null;
  permissions: PermissionKey[];
  phoneAreaCode: string | null;
  phoneNumber: string | null;
  birthDate: Date | null;
  provinceId: string | null;
  cityId: string | null;
  marketingOptIn: boolean;
  isActive: boolean;
  createdAt: Date;
}

export function toPublicUser(user: User, tenantSlug: string | null, permissions: PermissionKey[] = []): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug,
    permissions,
    phoneAreaCode: user.phoneAreaCode,
    phoneNumber: user.phoneNumber,
    birthDate: user.birthDate,
    provinceId: user.provinceId,
    cityId: user.cityId,
    marketingOptIn: user.marketingOptIn,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
