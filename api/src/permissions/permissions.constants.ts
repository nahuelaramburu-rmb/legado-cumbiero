import { PermissionKey } from '@prisma/client';

/**
 * Categorías de permiso que un TENANT_ADMIN puede otorgar a su TENANT_STAFF.
 * TENANT_ADMIN tiene las 4 implícitas dentro de su propio tenant; un
 * TENANT_STAFF sólo tiene las que se le hayan asignado explícitamente
 * (tabla StaffPermission).
 */
export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  [PermissionKey.SHOWS_MANAGE]: 'Gestionar shows y line-up',
  [PermissionKey.RESERVATIONS_MANAGE]: 'Gestionar reservas',
  [PermissionKey.GUEST_LIST_MANAGE]: 'Gestionar lista de invitados',
  [PermissionKey.TENANT_SETTINGS_MANAGE]: 'Editar datos del boliche',
};

export const ALL_PERMISSION_KEYS = Object.values(PermissionKey);
