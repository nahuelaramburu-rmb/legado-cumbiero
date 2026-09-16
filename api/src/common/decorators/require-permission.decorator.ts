import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '@prisma/client';

/**
 * Requiere que el usuario tenga esta categoría de permiso para el tenant de
 * la ruta. SUPER_ADMIN y TENANT_ADMIN (dentro de su propio tenant) siempre
 * pasan, sin importar este decorator — ver PermissionsGuard.
 */
export const PERMISSION_KEY = 'permission';
export const RequirePermission = (key: PermissionKey) => SetMetadata(PERMISSION_KEY, key);
