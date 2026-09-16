import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffPermissionsDto } from './dto/update-staff-permissions.dto';
import { UsersService } from './users.service';

/** Gestión del staff de un boliche — TENANT_ADMIN (dueño de su boliche) o SUPER_ADMIN (dueño de todo). Nunca TENANT_STAFF. */
@ApiTags('users')
@Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN)
@UseGuards(RolesGuard, TenantScopeGuard)
@Controller('tenants/:tenantSlug/staff')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Param('tenantSlug') tenantSlug: string) {
    return this.usersService.listStaff(tenantSlug);
  }

  @Post()
  create(@Param('tenantSlug') tenantSlug: string, @Body() dto: CreateStaffUserDto) {
    return this.usersService.createStaff(tenantSlug, dto);
  }

  @Patch(':userId/permissions')
  updatePermissions(
    @Param('tenantSlug') tenantSlug: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateStaffPermissionsDto,
  ) {
    return this.usersService.updatePermissions(tenantSlug, userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':userId')
  async deactivate(@Param('tenantSlug') tenantSlug: string, @Param('userId') userId: string) {
    await this.usersService.deactivate(tenantSlug, userId);
  }
}
