import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionKey, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@Controller('tenants/:tenantSlug')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /** Checkout público, sin login — misma UX que hoy (paridad con db.createReservation). */
  @Public()
  @Post('shows/:showId/reservations')
  create(@Param('tenantSlug') tenantSlug: string, @Param('showId') showId: string, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(tenantSlug, showId, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.TENANT_STAFF)
  @RequirePermission(PermissionKey.RESERVATIONS_MANAGE)
  @UseGuards(RolesGuard, TenantScopeGuard, PermissionsGuard)
  @Get('reservations')
  list(@Param('tenantSlug') tenantSlug: string) {
    return this.reservationsService.listByTenant(tenantSlug);
  }
}
