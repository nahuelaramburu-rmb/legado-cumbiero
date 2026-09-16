import { Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '@prisma/client';
import { slugify } from '../common/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({ orderBy: { name: 'asc' } });
  }

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

  async findBySlugOrThrow(slug: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Boliche no encontrado');
    return tenant;
  }

  findBySlug(slug: string): Promise<Tenant | null> {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const baseSlug = slugify(dto.name);
    let slug = baseSlug;
    let i = 1;
    while (await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${baseSlug}-${i++}`;
    }

    return this.prisma.tenant.create({
      data: {
        slug,
        name: dto.name,
        city: dto.city,
        description: dto.description ?? '',
        accentColor: dto.accentColor ?? '#E9376F',
        amenities: dto.amenities?.length ? dto.amenities : ['Bailable', 'Bar'],
      },
    });
  }

  async update(slug: string, dto: UpdateTenantDto): Promise<Tenant> {
    await this.findBySlugOrThrow(slug);
    return this.prisma.tenant.update({
      where: { slug },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.accentColor !== undefined && { accentColor: dto.accentColor }),
        ...(dto.amenities !== undefined && { amenities: dto.amenities }),
      },
    });
  }
}
