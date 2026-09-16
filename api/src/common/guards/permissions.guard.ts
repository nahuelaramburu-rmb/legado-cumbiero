import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionKey, Role } from '@prisma/client';
import { AuthUser } from '../../auth/auth-user.type';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

/**
 * Exige una categoría de permiso puntual (@RequirePermission(...)) para
 * TENANT_STAFF. SUPER_ADMIN y TENANT_ADMIN (ya validado su tenant por
 * TenantScopeGuard) siempre pasan. Se aplica DESPUÉS de TenantScopeGuard.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionKey>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('No autenticado');

    if (user.role === Role.SUPER_ADMIN || user.role === Role.TENANT_ADMIN) return true;

    if (user.role === Role.TENANT_STAFF && user.permissions.includes(required)) return true;

    throw new ForbiddenException('No tenés el permiso necesario para esta acción');
  }
}
