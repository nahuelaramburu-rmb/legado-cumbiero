import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionKey, Role } from '@prisma/client';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestStatusDto } from './dto/update-guest-status.dto';
import { GuestListService } from './guest-list.service';

@ApiTags('guest-list')
@Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.TENANT_STAFF)
@RequirePermission(PermissionKey.GUEST_LIST_MANAGE)
@UseGuards(RolesGuard, TenantScopeGuard, PermissionsGuard)
@Controller('tenants/:tenantSlug')
export class GuestListController {
  constructor(private readonly guestListService: GuestListService) {}

  @Get('guests')
  listAll(@Param('tenantSlug') tenantSlug: string) {
    return this.guestListService.listForTenant(tenantSlug);
  }

  @Get('shows/:showId/guests')
  list(@Param('tenantSlug') tenantSlug: string, @Param('showId') showId: string) {
    return this.guestListService.listForShow(tenantSlug, showId);
  }

  @Post('shows/:showId/guests')
  create(@Param('tenantSlug') tenantSlug: string, @Param('showId') showId: string, @Body() dto: CreateGuestDto) {
    return this.guestListService.create(tenantSlug, showId, dto);
  }

  @Patch('guests/:guestId')
  updateStatus(@Param('tenantSlug') tenantSlug: string, @Param('guestId') guestId: string, @Body() dto: UpdateGuestStatusDto) {
    return this.guestListService.updateStatus(tenantSlug, guestId, dto);
  }
}
