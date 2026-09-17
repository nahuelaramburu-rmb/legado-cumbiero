import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: TenantsService,
  ) {}

  /** Sólo boliches activos — uno desactivado desaparece también de "Tus favoritos". */
  async listForUser(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId, tenant: { isActive: true } },
      include: { tenant: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.tenant);
  }

  async isFavorited(userId: string, tenantSlug: string): Promise<{ favorited: boolean }> {
    const tenant = await this.tenants.findBySlug(tenantSlug);
    if (!tenant) return { favorited: false };
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_tenantId: { userId, tenantId: tenant.id } },
    });
    return { favorited: !!fav };
  }

  async add(userId: string, tenantSlug: string): Promise<{ favorited: boolean }> {
    const tenant = await this.tenants.findActiveBySlugOrThrow(tenantSlug);
    await this.prisma.favorite.upsert({
      where: { userId_tenantId: { userId, tenantId: tenant.id } },
      update: {},
      create: { userId, tenantId: tenant.id },
    });
    return { favorited: true };
  }

  async remove(userId: string, tenantSlug: string): Promise<void> {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    await this.prisma.favorite.deleteMany({ where: { userId, tenantId: tenant.id } });
  }
}
