import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PermissionKey } from '@prisma/client';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Roles(Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @Get('with-counts')
  findAllWithCounts() {
    return this.tenantsService.findAllWithCounts();
  }

  @Public()
  @Get('with-next-show')
  findAllWithNextShow() {
    return this.tenantsService.findAllWithNextShow();
  }

  @Public()
  @Get(':tenantSlug')
  findOne(@Param('tenantSlug') tenantSlug: string) {
    return this.tenantsService.findBySlugOrThrow(tenantSlug);
  }

  @Roles(Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.TENANT_STAFF)
  @RequirePermission(PermissionKey.TENANT_SETTINGS_MANAGE)
  @UseGuards(RolesGuard, TenantScopeGuard, PermissionsGuard)
  @Patch(':tenantSlug')
  update(@Param('tenantSlug') tenantSlug: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(tenantSlug, dto);
  }
}
