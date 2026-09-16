import { Body, Controller, Get, Ip, Headers, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { toPublicUser } from '../users/user-public.type';
import { AuthUser } from './auth-user.type';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

/** Rate limit más estricto que el default global, para frenar fuerza bruta. */
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  async register(@Body() dto: RegisterDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    const user = await this.authService.register(dto);
    const tokens = await this.authService.issueTokens(user, { ip, userAgent });
    const authUser = await this.authService.buildAuthUser(user);
    return { user: toPublicUser(user, authUser.tenantSlug, authUser.permissions), ...tokens };
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() _dto: LoginDto, @Req() req: Request, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    // LocalStrategy ya validó email+password y dejó el User en req.user
    const user = req.user as User;
    const tokens = await this.authService.issueTokens(user, { ip, userAgent });
    const authUser = await this.authService.buildAuthUser(user);
    return { user: toPublicUser(user, authUser.tenantSlug, authUser.permissions), ...tokens };
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.authService.rotateRefreshToken(dto.refreshToken, { ip, userAgent });
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Body() dto: RefreshDto) {
    await this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  async me(@CurrentUser() authUser: AuthUser) {
    const user = await this.authService.getUserOrThrow(authUser.id);
    return toPublicUser(user, authUser.tenantSlug, authUser.permissions);
  }
}
