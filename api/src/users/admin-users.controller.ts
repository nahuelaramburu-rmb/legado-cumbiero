import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthUser } from '../auth/auth-user.type';
import { CreateTenantAdminDto } from './dto/create-tenant-admin.dto';
import { UpdateUserActiveDto } from './dto/update-user-active.dto';
import { UsersService } from './users.service';

/** Gestión de usuarios de toda la plataforma — sólo SUPER_ADMIN (panel maestro). */
@ApiTags('admin-users')
@Roles(Role.SUPER_ADMIN)
@UseGuards(RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.listAll();
  }

  @Post('tenant-admin')
  createTenantAdmin(@Body() dto: CreateTenantAdminDto) {
    return this.usersService.createTenantAdmin(dto);
  }

  @Patch(':id/active')
  setActive(@Param('id') id: string, @Body() dto: UpdateUserActiveDto, @CurrentUser() currentUser: AuthUser) {
    return this.usersService.setActive(id, dto.isActive, currentUser.id);
  }
}
