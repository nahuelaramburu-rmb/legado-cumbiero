import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionKey, Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { AuthUser } from '../auth/auth-user.type';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@Controller('tenants/:tenantSlug')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /** Requiere estar logueado (cualquier rol) — ya no admite checkout de invitado. */
  @Post('shows/:showId/reservations')
  create(
    @Param('tenantSlug') tenantSlug: string,
    @Param('showId') showId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(tenantSlug, showId, user.id, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.TENANT_STAFF)
  @RequirePermission(PermissionKey.RESERVATIONS_MANAGE)
  @UseGuards(RolesGuard, TenantScopeGuard, PermissionsGuard)
  @Get('reservations')
  list(@Param('tenantSlug') tenantSlug: string) {
    return this.reservationsService.listByTenant(tenantSlug);
  }

  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.TENANT_STAFF)
  @RequirePermission(PermissionKey.RESERVATIONS_MANAGE)
  @UseGuards(RolesGuard, TenantScopeGuard, PermissionsGuard)
  @Patch('reservations/:id/cancel')
  cancel(@Param('tenantSlug') tenantSlug: string, @Param('id') id: string) {
    return this.reservationsService.cancel(tenantSlug, id);
  }
}
