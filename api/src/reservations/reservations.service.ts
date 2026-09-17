import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: TenantsService,
  ) {}

  async create(tenantSlug: string, showId: string, userId: string, dto: CreateReservationDto) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);

    const show = await this.prisma.show.findFirst({ where: { id: showId, tenantId: tenant.id } });
    if (!show) throw new NotFoundException('Show no encontrado');

    return this.prisma.reservation.create({
      data: {
        tenantId: tenant.id,
        showId,
        userId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        quantity: dto.quantity,
      },
    });
  }

  async listByTenant(tenantSlug: string) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    return this.prisma.reservation.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      include: { show: { select: { id: true, title: true, date: true } } },
    });
  }

  /** Reservas de un usuario, en todos los tenants — para "Mis reservas". */
  async listByUser(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        show: { select: { id: true, title: true, date: true } },
        tenant: { select: { slug: true, name: true, accentColor: true } },
      },
    });
  }
}
