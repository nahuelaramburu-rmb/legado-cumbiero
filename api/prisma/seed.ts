import { PermissionKey, PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

// Datos de ejemplo alineados al mockup de marca — mismo set que el viejo
// scripts/seed.ts (SQLite): El Túnel, K'mina Club, El Galpón y Bunker.
// Sólo para desarrollo local: se niega a correr si NODE_ENV=production.

if (process.env.NODE_ENV === 'production') {
  console.error('El seed de ejemplo no corre en producción. Usá scripts/migrate-sqlite-to-postgres.ts para datos reales.');
  process.exit(1);
}

const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Cumbia123!';

function inDays(days: number, hour = 23) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function createTenantWithAdmin(input: {
  name: string;
  city: string;
  description: string;
  accentColor: string;
  amenities: string[];
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
}) {
  const slug = input.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const tenant = await prisma.tenant.create({
    data: {
      slug,
      name: input.name,
      city: input.city,
      description: input.description,
      accentColor: input.accentColor,
      amenities: input.amenities,
    },
  });

  const passwordHash = await argon2.hash(SEED_PASSWORD, { type: argon2.argon2id });
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      firstName: input.adminFirstName,
      lastName: input.adminLastName,
      email: input.adminEmail,
      passwordHash,
      role: Role.TENANT_ADMIN,
    },
  });

  return tenant;
}

async function createShow(input: {
  tenantId: string;
  title: string;
  date: Date;
  capacity: number;
  ticketPrice: number;
  artistNames: string[];
  genre: string;
}) {
  const show = await prisma.show.create({
    data: {
      tenantId: input.tenantId,
      title: input.title,
      date: input.date,
      capacity: input.capacity,
      ticketPrice: input.ticketPrice,
    },
  });

  for (const name of input.artistNames) {
    const artist = await prisma.artist.create({
      data: { tenantId: input.tenantId, name, genre: input.genre },
    });
    await prisma.showArtist.create({ data: { showId: show.id, artistId: artist.id } });
  }

  return show;
}

async function main() {
  console.log('Limpiando datos existentes...');
  await prisma.$transaction([
    prisma.reservation.deleteMany(),
    prisma.guestListEntry.deleteMany(),
    prisma.showArtist.deleteMany(),
    prisma.show.deleteMany(),
    prisma.artist.deleteMany(),
    prisma.staffPermission.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
    prisma.tenant.deleteMany(),
  ]);

  const superAdminPasswordHash = await argon2.hash(SEED_PASSWORD, { type: argon2.argon2id });
  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Plataforma',
      email: 'admin@legadocumbiero.com',
      passwordHash: superAdminPasswordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const elTunel = await createTenantWithAdmin({
    name: 'El Túnel',
    city: 'La Plata',
    description:
      "El clásico de la cumbia, con toda la onda de los 90's y 2000's. Un boliche mítico, con la mejor música, ambiente y gente linda.",
    accentColor: '#FF2E93',
    amenities: ["Cumbia 90's/2000's", 'Bailable', 'Bar', 'Estacionamiento'],
    adminFirstName: 'Romina',
    adminLastName: 'Gómez',
    adminEmail: 'romina@eltunel.com',
  });

  const kmina = await createTenantWithAdmin({
    name: "K'mina Club",
    city: 'La Plata',
    description: 'Cumbia total y reggaetón clásico, todos los viernes. El after de los sábados de La Plata.',
    accentColor: '#FFD400',
    amenities: ['Cumbia Total', 'Bailable', 'Bar'],
    adminFirstName: 'Diego',
    adminLastName: 'Cabral',
    adminEmail: 'diego@kmina.com',
  });

  const elGalpon = await createTenantWithAdmin({
    name: 'El Galpón',
    city: 'Berisso',
    description: 'Cumbia sin límites: el salón más grande de la zona, shows en vivo todos los fines de semana.',
    accentColor: '#22E1E1',
    amenities: ['Cumbia sin límites', 'Bailable', 'Bar', 'Estacionamiento'],
    adminFirstName: 'Marisa',
    adminLastName: 'Ledesma',
    adminEmail: 'marisa@elgalpon.com',
  });

  const bunker = await createTenantWithAdmin({
    name: 'Bunker',
    city: 'Ensenada',
    description: 'Cumbia y cuarteto en el boliche under de Ensenada. La fiesta de tu vida, todos los fines de semana.',
    accentColor: '#8B2FF2',
    amenities: ['Cumbia/Cuarteto', 'Bailable', 'Bar'],
    adminFirstName: 'Nahuel',
    adminLastName: 'Torres',
    adminEmail: 'nahuel@bunker.com',
  });

  // Un staff de ejemplo con permisos parciales, para probar TENANT_STAFF.
  await prisma.user.create({
    data: {
      tenantId: elTunel.id,
      firstName: 'Bruno',
      lastName: 'Paredes',
      email: 'bruno@eltunel.com',
      passwordHash: await argon2.hash(SEED_PASSWORD, { type: argon2.argon2id }),
      role: Role.TENANT_STAFF,
      staffPermissions: {
        create: [{ key: PermissionKey.GUEST_LIST_MANAGE }, { key: PermissionKey.RESERVATIONS_MANAGE }],
      },
    },
  });

  const show1 = await createShow({
    tenantId: elTunel.id,
    title: 'La Rumba',
    date: inDays(4, 23),
    capacity: 300,
    ticketPrice: 8000,
    artistNames: ['Los Reyes del Ritmo', 'DJ Fierro'],
    genre: "Cumbia 90's/2000's",
  });

  const show2 = await createShow({
    tenantId: elTunel.id,
    title: 'Cumbia Time',
    date: inDays(11, 23),
    capacity: 300,
    ticketPrice: 8500,
    artistNames: ['La Tropa Cumbiera'],
    genre: "Cumbia 90's/2000's",
  });

  await createShow({
    tenantId: elTunel.id,
    title: 'Cumbia Nostalgia',
    date: inDays(28, 23),
    capacity: 350,
    ticketPrice: 9000,
    artistNames: ['Los Reyes del Ritmo'],
    genre: "Cumbia 90's/2000's",
  });

  const show3 = await createShow({
    tenantId: kmina.id,
    title: "La K'mina",
    date: inDays(6, 0),
    capacity: 220,
    ticketPrice: 6000,
    artistNames: ['Grupo Fuego Sur'],
    genre: 'Cumbia/Reggaetón clásico',
  });

  const show4 = await createShow({
    tenantId: elGalpon.id,
    title: 'El Galpón · Cumbia sin límites',
    date: inDays(14, 23),
    capacity: 400,
    ticketPrice: 7500,
    artistNames: ['Cumbia Real Show', 'Los Auténticos del Barrio'],
    genre: 'Cumbia sin límites',
  });

  const show5 = await createShow({
    tenantId: bunker.id,
    title: 'La Fiesta de tu Vida',
    date: inDays(20, 0),
    capacity: 250,
    ticketPrice: 7000,
    artistNames: ['Los Herederos'],
    genre: 'Cumbia/Cuarteto',
  });

  // Reservar ahora requiere cuenta — se crean clientes de ejemplo para las
  // reservas de muestra (contraseña: SEED_PASSWORD, igual que el resto).
  const customerPasswordHash = await argon2.hash(SEED_PASSWORD, { type: argon2.argon2id });
  const sampleCustomers = await Promise.all(
    [
      { firstName: 'Micaela', lastName: 'Fernández', email: 'micaela.fernandez@example.com', phoneAreaCode: '221', phoneNumber: '5550142' },
      { firstName: 'Julián', lastName: 'Pérez', email: 'julian.perez@example.com', phoneAreaCode: '221', phoneNumber: '5550198' },
      { firstName: 'Sofía', lastName: 'Ríos', email: 'sofia.rios@example.com', phoneAreaCode: '221', phoneNumber: '5550177' },
      { firstName: 'Bruno', lastName: 'Alsina', email: 'bruno.alsina@example.com', phoneAreaCode: '221', phoneNumber: '5550133' },
      { firstName: 'Nahuel', lastName: 'Aramburu', email: 'nahuel.aramburu.cliente@example.com', phoneAreaCode: '221', phoneNumber: '5550111' },
      { firstName: 'Marisa', lastName: 'Ledesma', email: 'marisa.ledesma@example.com', phoneAreaCode: '221', phoneNumber: '5550155' },
    ].map((c) => prisma.user.create({ data: { ...c, passwordHash: customerPasswordHash, role: Role.CUSTOMER } })),
  );
  const [micaela, julian, sofia, brunoAlsina, nahuelCliente, marisa] = sampleCustomers;
  const fullName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`;

  await prisma.reservation.createMany({
    data: [
      { tenantId: elTunel.id, showId: show1.id, userId: micaela.id, customerName: fullName(micaela), customerPhone: '+54 221 555-0142', quantity: 2 },
      { tenantId: elTunel.id, showId: show1.id, userId: julian.id, customerName: fullName(julian), customerPhone: '+54 221 555-0198', quantity: 4 },
      { tenantId: elTunel.id, showId: show2.id, userId: sofia.id, customerName: fullName(sofia), customerPhone: '+54 221 555-0177', quantity: 3 },
      { tenantId: kmina.id, showId: show3.id, userId: brunoAlsina.id, customerName: fullName(brunoAlsina), customerPhone: '+54 221 555-0133', quantity: 2 },
      { tenantId: elGalpon.id, showId: show4.id, userId: nahuelCliente.id, customerName: fullName(nahuelCliente), customerPhone: '+54 221 555-0111', quantity: 2 },
      { tenantId: bunker.id, showId: show5.id, userId: marisa.id, customerName: fullName(marisa), customerPhone: '+54 221 555-0155', quantity: 5 },
    ],
  });

  await prisma.guestListEntry.createMany({
    data: [
      { tenantId: elTunel.id, showId: show1.id, name: 'Bruno (staff sonido)', plusOnes: 1 },
      { tenantId: kmina.id, showId: show3.id, name: 'Grupo Fuego Sur (managers)', plusOnes: 3 },
      { tenantId: elGalpon.id, showId: show4.id, name: 'Marisa (dueña)', plusOnes: 1 },
      { tenantId: bunker.id, showId: show5.id, name: 'Prensa Ensenada', plusOnes: 2 },
    ],
  });

  console.log('Seed completo: 4 boliches + admin de plataforma + 1 staff de ejemplo.');
  console.log(`Contraseña de todas las cuentas de ejemplo: ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
