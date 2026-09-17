import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { CreateShowDto } from './dto/create-show.dto';

const LINEUP_INCLUDE = { lineup: { include: { artist: true } } } as const;

@Injectable()
export class ShowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: TenantsService,
  ) {}

  async listUpcoming(opts: { limit?: number; tenantSlug?: string } = {}) {
    return this.prisma.show.findMany({
      where: {
        date: { gte: new Date() },
        ...(opts.tenantSlug && { tenant: { slug: opts.tenantSlug } }),
      },
      orderBy: { date: 'asc' },
      take: opts.limit,
      include: { ...LINEUP_INCLUDE, tenant: true },
    });
  }

  async findByIdOrThrow(id: string) {
    const show = await this.prisma.show.findUnique({ where: { id }, include: LINEUP_INCLUDE });
    if (!show) throw new NotFoundException('Show no encontrado');
    return show;
  }

  /**
   * Listado público: sin reservas/nombres de clientes, pero sí el total de
   * entradas ya vendidas por show (reservedCount) para poder mostrar cupo
   * disponible sin exponer quién reservó.
   */
  async listByTenant(tenantSlug: string) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    const shows = await this.prisma.show.findMany({
      where: { tenantId: tenant.id },
      orderBy: { date: 'asc' },
      include: LINEUP_INCLUDE,
    });

    const sums = await this.prisma.reservation.groupBy({
      by: ['showId'],
      where: { tenantId: tenant.id, status: 'confirmada' },
      _sum: { quantity: true },
    });
    const reservedByShow = new Map(sums.map((s) => [s.showId, s._sum.quantity ?? 0]));

    return shows.map((show) => ({ ...show, reservedCount: reservedByShow.get(show.id) ?? 0 }));
  }

  async create(tenantSlug: string, dto: CreateShowDto) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);

    const showId = await this.prisma.$transaction(async (tx) => {
      const show = await tx.show.create({
        data: {
          tenantId: tenant.id,
          title: dto.title,
          date: new Date(dto.date),
          capacity: dto.capacity ?? 200,
          ticketPrice: dto.ticketPrice ?? 0,
        },
      });

      for (const name of dto.artistNames) {
        const existingArtist = await tx.artist.findFirst({ where: { tenantId: tenant.id, name } });
        const artist = existingArtist
          ? dto.genre
            ? await tx.artist.update({ where: { id: existingArtist.id }, data: { genre: dto.genre } })
            : existingArtist
          : await tx.artist.create({ data: { tenantId: tenant.id, name, genre: dto.genre ?? 'Cumbia' } });

        await tx.showArtist.create({ data: { showId: show.id, artistId: artist.id } });
      }

      return show.id;
    });

    return this.findByIdOrThrow(showId);
  }
}
