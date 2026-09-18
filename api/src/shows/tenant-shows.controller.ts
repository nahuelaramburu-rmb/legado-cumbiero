import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { PermissionKey, Role } from '@prisma/client';
import { memoryStorage } from 'multer';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TenantScopeGuard } from '../common/guards/tenant-scope.guard';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { ShowsService } from './shows.service';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB

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

  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.TENANT_STAFF)
  @RequirePermission(PermissionKey.SHOWS_MANAGE)
  @UseGuards(RolesGuard, TenantScopeGuard, PermissionsGuard)
  @Patch(':showId')
  update(
    @Param('tenantSlug') tenantSlug: string,
    @Param('showId') showId: string,
    @Body() dto: UpdateShowDto,
  ) {
    return this.showsService.update(tenantSlug, showId, dto);
  }

  @Roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.TENANT_STAFF)
  @RequirePermission(PermissionKey.SHOWS_MANAGE)
  @UseGuards(RolesGuard, TenantScopeGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: MAX_IMAGE_SIZE } }))
  @Patch(':showId/image')
  updateImage(
    @Param('tenantSlug') tenantSlug: string,
    @Param('showId') showId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.showsService.updateImage(tenantSlug, showId, file);
  }
}
