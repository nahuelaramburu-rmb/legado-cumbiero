import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

const GEOREF_BASE = 'https://apis.datos.gob.ar/georef/api';
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

interface GeorefProvincia {
  id: string;
  nombre: string;
}
interface GeorefMunicipio {
  id: string;
  nombre: string;
}

/**
 * Provincias/ciudades de Argentina, cacheadas en Postgres desde la API
 * pública de Georef (apis.datos.gob.ar) — así el selector del formulario de
 * boliche nunca depende de una API externa en el camino caliente. Se
 * revalida sola cada 30 días (cron mensual + fallback lazy si la tabla
 * está vacía o vencida).
 */
@Injectable()
export class LocationsService implements OnModuleInit {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // No bloquear el arranque del server esperando la sync.
    this.ensureFresh().catch((e) => this.logger.error('Sync de locations falló en el arranque', e));
  }

  async ensureFresh(): Promise<void> {
    const latest = await this.prisma.province.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });
    const isStale = !latest || Date.now() - latest.updatedAt.getTime() > STALE_AFTER_MS;
    if (isStale) await this.syncFromGeoref();
  }

  @Cron('0 4 1 * *') // 04:00 del día 1 de cada mes
  async scheduledSync() {
    await this.syncFromGeoref().catch((e) => this.logger.error('Sync mensual de locations falló', e));
  }

  async syncFromGeoref(): Promise<void> {
    this.logger.log('Sincronizando provincias/ciudades desde Georef...');

    const provRes = await fetch(`${GEOREF_BASE}/provincias?campos=id,nombre&max=30`);
    if (!provRes.ok) throw new Error(`Georef /provincias respondió ${provRes.status}`);
    const provData = (await provRes.json()) as { provincias: GeorefProvincia[] };

    for (const p of provData.provincias) {
      await this.prisma.province.upsert({
        where: { id: p.id },
        update: { name: p.nombre },
        create: { id: p.id, name: p.nombre },
      });

      const muniRes = await fetch(`${GEOREF_BASE}/municipios?provincia=${p.id}&campos=id,nombre&max=999`);
      if (!muniRes.ok) {
        this.logger.warn(`Georef /municipios?provincia=${p.id} respondió ${muniRes.status}, se omite`);
        continue;
      }
      const muniData = (await muniRes.json()) as { municipios: GeorefMunicipio[] };
      for (const m of muniData.municipios) {
        await this.prisma.city.upsert({
          where: { id: m.id },
          update: { name: m.nombre, provinceId: p.id },
          create: { id: m.id, name: m.nombre, provinceId: p.id },
        });
      }
    }

    this.logger.log('Sync de provincias/ciudades completo.');
  }

  getAllWithCities() {
    return this.prisma.province.findMany({
      orderBy: { name: 'asc' },
      include: { cities: { orderBy: { name: 'asc' } } },
    });
  }
}
