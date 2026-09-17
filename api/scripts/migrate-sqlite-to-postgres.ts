/**
 * Migración única, idempotente: copia todos los datos de la SQLite vieja
 * (src/lib/db.ts del monorepo Next.js) a Postgres vía Prisma. Usa upsert
 * por id preservado, así URLs como /el-tunel siguen funcionando.
 *
 * Uso:
 *   SQLITE_PATH=../data/legado-cumbiero.db DATABASE_URL=postgresql://... \
 *     npm run migrate:sqlite
 *
 * Ejecutar primero contra una COPIA del archivo de producción, nunca contra
 * el original directamente — ver api/README.md "Migración de datos".
 */
import { DatabaseSync } from 'node:sqlite';
import { GuestStatus, PrismaClient, ReservationStatus, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';

const SQLITE_PATH = process.env.SQLITE_PATH ?? '../data/legado-cumbiero.db';

const prisma = new PrismaClient();
const sqlite = new DatabaseSync(SQLITE_PATH, { readOnly: true });

function rows<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  return sqlite.prepare(sql).all(...(params as never[])) as T[];
}

function toEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T, context: string): T {
  const v = String(value);
  if ((allowed as readonly string[]).includes(v)) return v as T;
  console.warn(`[migrate] valor inesperado "${v}" en ${context}, uso "${fallback}"`);
  return fallback;
}

async function main() {
  console.log(`Leyendo SQLite desde: ${SQLITE_PATH}`);

  let tenantCount = 0;
  for (const t of rows<{
    id: string;
    slug: string;
    name: string;
    city: string;
    description: string;
    accentColor: string;
    amenities: string;
    createdAt: string;
  }>('SELECT * FROM Tenant')) {
    await prisma.tenant.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        slug: t.slug,
        name: t.name,
        city: t.city,
        description: t.description,
        accentColor: t.accentColor,
        amenities: String(t.amenities ?? '')
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean),
        createdAt: new Date(t.createdAt),
      },
    });
    tenantCount++;
  }
  console.log(`Tenants migrados: ${tenantCount}`);

  // La User vieja es decorativa (sin password, role libre). Se migra como
  // TENANT_ADMIN inactivo con password inutilizable — hay que resetearla a
  // mano post-migración (son pocas cuentas, ver el README).
  let userCount = 0;
  for (const u of rows<{ id: string; tenantId: string; name: string; email: string; createdAt: string }>(
    'SELECT * FROM User',
  )) {
    const existingByEmail = await prisma.user.findUnique({ where: { email: u.email } });
    if (existingByEmail && existingByEmail.id !== u.id) {
      console.warn(`[migrate] email duplicado "${u.email}" (User ${u.id}), se omite — ya existe como ${existingByEmail.id}`);
      continue;
    }
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        tenantId: u.tenantId,
        firstName: u.name,
        lastName: '-',
        email: u.email,
        passwordHash: await argon2.hash(randomUUID(), { type: argon2.argon2id }),
        role: Role.TENANT_ADMIN,
        isActive: false,
        createdAt: new Date(u.createdAt),
      },
    });
    userCount++;
  }
  console.log(`Users migrados (inactivos, requieren reset de password): ${userCount}`);

  let artistCount = 0;
  for (const a of rows<{ id: string; tenantId: string; name: string; genre: string }>('SELECT * FROM Artist')) {
    await prisma.artist.upsert({
      where: { id: a.id },
      update: {},
      create: { id: a.id, tenantId: a.tenantId, name: a.name, genre: a.genre },
    });
    artistCount++;
  }
  console.log(`Artists migrados: ${artistCount}`);

  let showCount = 0;
  for (const s of rows<{
    id: string;
    tenantId: string;
    title: string;
    date: string;
    capacity: number;
    ticketPrice: number;
  }>('SELECT * FROM Show')) {
    await prisma.show.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        tenantId: s.tenantId,
        title: s.title,
        date: new Date(s.date),
        capacity: s.capacity,
        ticketPrice: s.ticketPrice,
      },
    });
    showCount++;
  }
  console.log(`Shows migrados: ${showCount}`);

  let lineupCount = 0;
  for (const sa of rows<{ id: string; showId: string; artistId: string; slotTime: string | null }>('SELECT * FROM ShowArtist')) {
    await prisma.showArtist.upsert({
      where: { id: sa.id },
      update: {},
      create: { id: sa.id, showId: sa.showId, artistId: sa.artistId, slotTime: sa.slotTime },
    });
    lineupCount++;
  }
  console.log(`Line-ups migrados: ${lineupCount}`);

  let guestCount = 0;
  for (const g of rows<{
    id: string;
    tenantId: string;
    showId: string;
    name: string;
    plusOnes: number;
    status: string;
    createdAt: string;
  }>('SELECT * FROM GuestListEntry')) {
    await prisma.guestListEntry.upsert({
      where: { id: g.id },
      update: {},
      create: {
        id: g.id,
        tenantId: g.tenantId,
        showId: g.showId,
        name: g.name,
        plusOnes: g.plusOnes,
        status: toEnum(g.status, Object.values(GuestStatus), GuestStatus.pendiente, `GuestListEntry ${g.id}`),
        createdAt: new Date(g.createdAt),
      },
    });
    guestCount++;
  }
  console.log(`Invitados migrados: ${guestCount}`);

  let reservationCount = 0;
  for (const r of rows<{
    id: string;
    tenantId: string;
    showId: string;
    customerName: string;
    customerPhone: string;
    quantity: number;
    status: string;
    createdAt: string;
  }>('SELECT * FROM Reservation')) {
    await prisma.reservation.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        tenantId: r.tenantId,
        showId: r.showId,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        quantity: r.quantity,
        status: toEnum(r.status, Object.values(ReservationStatus), ReservationStatus.confirmada, `Reservation ${r.id}`),
        createdAt: new Date(r.createdAt),
      },
    });
    reservationCount++;
  }
  console.log(`Reservas migradas: ${reservationCount}`);

  console.log('Migración completa.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });
