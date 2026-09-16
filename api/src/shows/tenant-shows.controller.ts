import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionKey, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { CreateShowDto } from './dto/create-show.dto';
import { ShowsService } from './shows.service';

@ApiTags('shows')
@Controller('tenants/:tenantSlug/shows')
export class TenantShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Public()
  @Get()
  list(@Param('tenantSlug') tenantSlug: string) {
    return this.showsService.listByTenant(tenantSlug);
  }

  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.TENANT_STAFF)
  @RequirePermission(PermissionKey.SHOWS_MANAGE)
  @UseGuards(RolesGuard, TenantScopeGuard, PermissionsGuard)
  @Post()
  create(@Param('tenantSlug') tenantSlug: string, @Body() dto: CreateShowDto) {
    return this.showsService.create(tenantSlug, dto);
  }
}
