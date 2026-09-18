import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '@prisma/client';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { slugify } from '../common/slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');
const ALLOWED_IMAGE_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

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
        address: dto.address,
        contactPhone: dto.contactPhone,
        instagram: dto.instagram,
        openingHours: dto.openingHours,
        minAge: dto.minAge,
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
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.contactPhone !== undefined && { contactPhone: dto.contactPhone }),
        ...(dto.instagram !== undefined && { instagram: dto.instagram }),
        ...(dto.openingHours !== undefined && { openingHours: dto.openingHours }),
        ...(dto.minAge !== undefined && { minAge: dto.minAge }),
      },
    });
  }

  async setActive(slug: string, isActive: boolean): Promise<Tenant> {
    await this.findBySlugOrThrow(slug);
    return this.prisma.tenant.update({ where: { slug }, data: { isActive } });
  }

  /** Logo (cuadrado, usado en cards/listados) y/o foto de portada (hero de su página pública). */
  async updateImages(
    slug: string,
    files: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<Tenant> {
    const tenant = await this.findBySlugOrThrow(slug);

    const data: { logoUrl?: string; coverImageUrl?: string } = {};
    if (files.logo?.[0]) data.logoUrl = await this.saveTenantImage(tenant.id, 'logo', files.logo[0], tenant.logoUrl);
    if (files.cover?.[0]) {
      data.coverImageUrl = await this.saveTenantImage(tenant.id, 'cover', files.cover[0], tenant.coverImageUrl);
    }
    if (Object.keys(data).length === 0) throw new BadRequestException('No se recibió ninguna imagen');

    return this.prisma.tenant.update({ where: { slug }, data });
  }

  private async saveTenantImage(
    tenantId: string,
    kind: 'logo' | 'cover',
    file: Express.Multer.File,
    previousUrl: string | null,
  ): Promise<string> {
    const ext = ALLOWED_IMAGE_MIME[file.mimetype];
    if (!ext) throw new BadRequestException('Formato de imagen no soportado — usá JPG, PNG o WEBP');

    const dir = path.join(UPLOADS_ROOT, 'tenants', tenantId);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${kind}-${Date.now()}.${ext}`;
    await fs.writeFile(path.join(dir, filename), file.buffer);

    if (previousUrl) {
      await fs.unlink(path.join(UPLOADS_ROOT, previousUrl.replace(/^\/uploads\//, ''))).catch(() => {});
    }

    return `/uploads/tenants/${tenantId}/${filename}`;
  }
}
