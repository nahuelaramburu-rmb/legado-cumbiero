import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PermissionKey, Role, User } from '@prisma/client';
import * as argon2 from 'argon2';
import ms, { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service';
import { AccessTokenPayload, AuthUser } from './auth-user.type';
import { RegisterDto } from './dto/register.dto';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Ya existe una cuenta con ese email');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: Role.CUSTOMER,
      },
    });
  }

  /** Usado por LocalStrategy. Devuelve el User de Prisma (no el AuthUser del JWT) si las credenciales son válidas. */
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return null;

    const valid = await argon2.verify(user.passwordHash, password).catch(() => false);
    if (!valid) return null;

    return user;
  }

  async buildAuthUser(user: User): Promise<AuthUser> {
    const tenant = user.tenantId
      ? await this.prisma.tenant.findUnique({ where: { id: user.tenantId }, select: { slug: true } })
      : null;

    let permissions: PermissionKey[] = [];
    if (user.role === Role.TENANT_STAFF) {
      const rows = await this.prisma.staffPermission.findMany({
        where: { userId: user.id },
        select: { key: true },
      });
      permissions = rows.map((r) => r.key);
    }

    return {
      id: user.id,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: tenant?.slug ?? null,
      permissions,
    };
  }

  async issueTokens(user: User, meta: { userAgent?: string; ip?: string }, family: string = randomUUID()): Promise<IssuedTokens> {
    const authUser = await this.buildAuthUser(user);

    const payload: AccessTokenPayload = {
      sub: authUser.id,
      role: authUser.role,
      tenantId: authUser.tenantId,
      tenantSlug: authUser.tenantSlug,
      permissions: authUser.permissions,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as StringValue,
    });

    const rawRefreshToken = randomBytes(48).toString('base64url');
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d');
    const refreshTokenExpiresAt = new Date(Date.now() + ms(refreshExpiresIn as StringValue));

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawRefreshToken),
        family,
        expiresAt: refreshTokenExpiresAt,
        userAgent: meta.userAgent,
        ip: meta.ip,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken, refreshTokenExpiresAt };
  }

  /**
   * Rota un refresh token. Si el token presentado ya fue reemplazado
   * (reuso de un token viejo — señal de robo), revoca toda la familia y
   * rechaza, forzando un login nuevo.
   */
  async rotateRefreshToken(rawRefreshToken: string, meta: { userAgent?: string; ip?: string }): Promise<IssuedTokens> {
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored) throw new UnauthorizedException('Sesión inválida');

    if (stored.revokedAt || stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.updateMany({
        where: { family: stored.family, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Sesión expirada o revocada, iniciá sesión de nuevo');
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('Cuenta inactiva');

    const issued = await this.issueTokens(user, meta, stored.family);

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedByTokenHash: hashToken(issued.refreshToken) },
    });

    return issued;
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getUserOrThrow(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }
}

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
