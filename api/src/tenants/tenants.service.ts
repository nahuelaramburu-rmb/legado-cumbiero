import { Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '@prisma/client';
import { slugify } from '../common/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Listado público — sólo boliches activos. */
  findAll(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  /** Cada tenant activo + su próximo show (a lo sumo 1) — para la home y /boliches. */
  findAllWithNextShow() {
    return this.prisma.tenant.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        shows: {
          where: { date: { gte: new Date() }, isActive: true },
          orderBy: { date: 'asc' },
          take: 1,
          include: { lineup: { include: { artist: true } } },
        },
      },
    });
  }

  /** SUPER_ADMIN — todos, activos e inactivos (para poder reactivarlos). */
  async findAllWithCounts() {
    const tenants = await this.prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
    return Promise.all(
      tenants.map(async (t) => {
        const [shows, reservations, guestEntries] = await Promise.all([
          this.prisma.show.count({ where: { tenantId: t.id } }),
          this.prisma.reservation.count({ where: { tenantId: t.id } }),
          this.prisma.guestListEntry.count({ where: { tenantId: t.id } }),
        ]);
        return { ...t, counts: { shows, reservations, guestEntries } };
      }),
    );
  }

  /** Uso interno/admin — no filtra por activo (staff/admin de un tenant desactivado sigue pudiendo operar). */
  async findBySlugOrThrow(slug: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Boliche no encontrado');
    return tenant;
  }

  findBySlug(slug: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  /** Para el público: 404 si no existe O si está desactivado. */
  async findActiveBySlugOrThrow(slug: string): Promise<Tenant> {
    const tenant = await this.findBySlugOrThrow(slug);
    if (!tenant.isActive) throw new NotFoundException('Boliche no encontrado');
    return tenant;
  }

  private async resolveCityName(cityId: string): Promise<string> {
    const city = await this.prisma.city.findUnique({ where: { id: cityId } });
    if (!city) throw new NotFoundException('Ciudad no encontrada');
    return city.name;
  }

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let i = 1;
    while (await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${i++}`;
    }

    const cityName = await this.resolveCityName(dto.cityId);

    return this.prisma.tenant.create({
      data: {
        slug,
        name: dto.name,
        city: cityName,
        provinceId: dto.provinceId,
        cityId: dto.cityId,
        description: dto.description ?? '',
        accentColor: dto.accentColor ?? '#E9376F',
        amenities: dto.amenities?.length ? dto.amenities : ['Bailable', 'Bar'],
      },
    });
  }

  async update(slug: string, dto: UpdateTenantDto): Promise<Tenant> {
    await this.findBySlugOrThrow(slug);
    const cityName = dto.cityId !== undefined ? await this.resolveCityName(dto.cityId) : undefined;

    return this.prisma.tenant.update({
      where: { slug },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(cityName !== undefined && { city: cityName }),
        ...(dto.provinceId !== undefined && { provinceId: dto.provinceId }),
        ...(dto.cityId !== undefined && { cityId: dto.cityId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.accentColor !== undefined && { accentColor: dto.accentColor }),
        ...(dto.amenities !== undefined && { amenities: dto.amenities }),
      },
    });
  }

  async setActive(slug: string, isActive: boolean): Promise<Tenant> {
    await this.findBySlugOrThrow(slug);
    return this.prisma.tenant.update({ where: { slug }, data: { isActive } });
  }
}
