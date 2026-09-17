import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionKey, Role } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';
import { TenantsService } from './tenants.service';

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

  /**
   * Sin filtrar por activo a propósito: lo usan tanto la página pública
   * (que sí debe ocultar un tenant desactivado — chequea `isActive` del
   * lado de Next.js) como el panel de admin del propio boliche (que debe
   * poder seguir viendo/operando aunque esté desactivado).
   */
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

  /** Activar/desactivar todo el boliche — sólo SUPER_ADMIN (no el propio admin del boliche). */
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @Patch(':tenantSlug/status')
  setActive(@Param('tenantSlug') tenantSlug: string, @Body() dto: UpdateTenantStatusDto) {
    return this.tenantsService.setActive(tenantSlug, dto.isActive);
  }
}
