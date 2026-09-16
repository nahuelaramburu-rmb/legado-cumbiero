import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser } from '../../auth/auth-user.type';

/**
 * Para rutas con un parámetro `:tenantSlug`: SUPER_ADMIN pasa siempre;
 * TENANT_ADMIN/TENANT_STAFF sólo pasan si el tenant de la ruta coincide con
 * el suyo propio; cualquier otro rol (ej. CUSTOMER) queda afuera.
 * Se aplica DESPUÉS de RolesGuard en rutas de administración de un tenant.
 */
@Injectable()
export class TenantScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('No autenticado');

    if (user.role === Role.SUPER_ADMIN) return true;

    const routeSlug = request.params?.tenantSlug;
    if (!routeSlug) return true; // ruta sin scoping por tenant, nada que validar acá

    if ((user.role === Role.TENANT_ADMIN || user.role === Role.TENANT_STAFF) && user.tenantSlug === routeSlug) {
      return true;
    }

    throw new ForbiddenException('No tenés acceso a este boliche');
  }
}
