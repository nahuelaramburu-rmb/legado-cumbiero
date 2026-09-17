import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestStatusDto } from './dto/update-guest-status.dto';

@Injectable()
export class GuestListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: TenantsService,
  ) {}

  async listForShow(tenantSlug: string, showId: string) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    return this.prisma.guestListEntry.findMany({
      where: { tenantId: tenant.id, showId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Todos los invitados del tenant (todos los shows) — para el panel de admin. */
  async listForTenant(tenantSlug: string) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    return this.prisma.guestListEntry.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantSlug: string, showId: string, dto: CreateGuestDto) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    const show = await this.prisma.show.findFirst({ where: { id: showId, tenantId: tenant.id } });
    if (!show) throw new NotFoundException('Show no encontrado');

    return this.prisma.guestListEntry.create({
      data: {
        tenantId: tenant.id,
        showId,
        name: dto.name,
        plusOnes: dto.plusOnes ?? 0,
      },
    });
  }

  async updateStatus(tenantSlug: string, guestId: string, dto: UpdateGuestStatusDto) {
    const tenant = await this.tenants.findBySlugOrThrow(tenantSlug);
    const guest = await this.prisma.guestListEntry.findFirst({ where: { id: guestId, tenantId: tenant.id } });
    if (!guest) throw new NotFoundException('Invitado no encontrado');

    return this.prisma.guestListEntry.update({ where: { id: guestId }, data: { status: dto.status } });
  }
}
