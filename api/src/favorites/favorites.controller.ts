import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth-user.type';
import { FavoritesService } from './favorites.service';

/** Boliches favoritos del usuario logueado. Sin @Public: requiere sesión (guard global). */
@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('me')
  listMine(@CurrentUser() user: AuthUser) {
    return this.favoritesService.listForUser(user.id);
  }

  @Get(':tenantSlug/mine')
  isFavorited(@CurrentUser() user: AuthUser, @Param('tenantSlug') tenantSlug: string) {
    return this.favoritesService.isFavorited(user.id, tenantSlug);
  }

  @Post(':tenantSlug')
  add(@CurrentUser() user: AuthUser, @Param('tenantSlug') tenantSlug: string) {
    return this.favoritesService.add(user.id, tenantSlug);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':tenantSlug')
  async remove(@CurrentUser() user: AuthUser, @Param('tenantSlug') tenantSlug: string) {
    await this.favoritesService.remove(user.id, tenantSlug);
  }
}
