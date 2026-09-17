import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PermissionKey, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { CreateTenantAdminDto } from './dto/create-tenant-admin.dto';
import { UpdateStaffPermissionsDto } from './dto/update-staff-permissions.dto';
import { toPublicUser } from './user-public.type';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: TenantsService,
  ) {}

  async listStaff(tenantSlug: string) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    const staff = await this.prisma.user.findMany({
      where: { tenantId: tenant.id, role: Role.TENANT_STAFF },
      include: { staffPermissions: true },
      orderBy: { createdAt: 'asc' },
    });
    return staff.map((u) =>
      toPublicUser(
        u,
        tenantSlug,
        u.staffPermissions.map((p) => p.key),
      ),
    );
  }

  async createStaff(tenantSlug: string, dto: CreateStaffUserDto) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Ya existe una cuenta con ese email');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: Role.TENANT_STAFF,
        staffPermissions: {
          create: dto.permissions.map((key) => ({ key })),
        },
      },
      include: { staffPermissions: true },
    });

    return toPublicUser(
      user,
      tenantSlug,
      user.staffPermissions.map((p) => p.key),
    );
  }

  async updatePermissions(tenantSlug: string, userId: string, dto: UpdateStaffPermissionsDto) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    const user = await this.getTenantStaffOrThrow(tenant.id, userId);

    await this.prisma.$transaction([
      this.prisma.staffPermission.deleteMany({ where: { userId } }),
      this.prisma.staffPermission.createMany({
        data: dto.permissions.map((key: PermissionKey) => ({ userId, key })),
      }),
    ]);

    return toPublicUser(user, tenantSlug, dto.permissions);
  }

  async deactivate(tenantSlug: string, userId: string) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    await this.getTenantStaffOrThrow(tenant.id, userId);
    await this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  }

  private async getTenantStaffOrThrow(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, role: Role.TENANT_STAFF },
    });
    if (!user) throw new NotFoundException('Miembro del staff no encontrado');
    return user;
  }

  /** Todos los usuarios de la plataforma — sólo para el panel maestro (SUPER_ADMIN). */
  async listAll() {
    const users = await this.prisma.user.findMany({
      include: { tenant: { select: { slug: true, name: true } }, staffPermissions: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) =>
      toPublicUser(
        u,
        u.tenant?.slug ?? null,
        u.staffPermissions.map((p) => p.key),
      ),
    );
  }

  async createTenantAdmin(dto: CreateTenantAdminDto) {
    const tenant = await this.tenants.findBySlugOrThrow(dto.tenantSlug);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Ya existe una cuenta con ese email');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: Role.TENANT_ADMIN,
      },
    });

    return toPublicUser(user, dto.tenantSlug);
  }

  async setActive(userId: string, isActive: boolean, requesterId: string) {
    if (userId === requesterId) throw new BadRequestException('No podés activar/desactivar tu propia cuenta');

    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { tenant: true } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updated = await this.prisma.user.update({ where: { id: userId }, data: { isActive } });
    return toPublicUser(updated, user.tenant?.slug ?? null);
  }
}
