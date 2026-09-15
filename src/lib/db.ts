import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";

// Legado Cumbiero — capa de datos multi-tenant.
// Usa el módulo nativo `node:sqlite` (Node 22+) para no depender de binarios
// externos: cada boliche (Tenant) es independiente, todo queda separado por
// tenantId dentro de la misma base.

const DB_PATH = path.join(process.cwd(), "data", "legado-cumbiero.db");

declare global {
  // eslint-disable-next-line no-var
  var __legadoDb: DatabaseSync | undefined;
}

function getDb(): DatabaseSync {
  if (!globalThis.__legadoDb) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS Tenant (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        accentColor TEXT NOT NULL DEFAULT '#E9376F',
        amenities TEXT NOT NULL DEFAULT 'Bailable,Bar',
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        tenantId TEXT NOT NULL REFERENCES Tenant(id),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        createdAt TEXT NOT NULL,
        UNIQUE(tenantId, email)
      );

      CREATE TABLE IF NOT EXISTS Artist (
        id TEXT PRIMARY KEY,
        tenantId TEXT NOT NULL REFERENCES Tenant(id),
        name TEXT NOT NULL,
        genre TEXT NOT NULL DEFAULT 'Cumbia'
      );

      CREATE TABLE IF NOT EXISTS Show (
        id TEXT PRIMARY KEY,
        tenantId TEXT NOT NULL REFERENCES Tenant(id),
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 200,
        ticketPrice INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS ShowArtist (
        id TEXT PRIMARY KEY,
        showId TEXT NOT NULL REFERENCES Show(id),
        artistId TEXT NOT NULL REFERENCES Artist(id),
        slotTime TEXT
      );

      CREATE TABLE IF NOT EXISTS GuestListEntry (
        id TEXT PRIMARY KEY,
        tenantId TEXT NOT NULL REFERENCES Tenant(id),
        showId TEXT NOT NULL REFERENCES Show(id),
        name TEXT NOT NULL,
        plusOnes INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pendiente',
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Reservation (
        id TEXT PRIMARY KEY,
        tenantId TEXT NOT NULL REFERENCES Tenant(id),
        showId TEXT NOT NULL REFERENCES Show(id),
        customerName TEXT NOT NULL,
        customerPhone TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'confirmada',
        createdAt TEXT NOT NULL
      );
    `);
    globalThis.__legadoDb = db;
  }
  return globalThis.__legadoDb;
}

// ---------- Tipos ----------

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  city: string;
  description: string;
  accentColor: string;
  amenities: string[];
  createdAt: Date;
}

export interface Artist {
  id: string;
  tenantId: string;
  name: string;
  genre: string;
}

export interface LineupEntry {
  id: string;
  showId: string;
  artistId: string;
  slotTime: string | null;
  artist: Artist;
}

export interface Reservation {
  id: string;
  tenantId: string;
  showId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  status: string;
  createdAt: Date;
}

export interface GuestEntry {
  id: string;
  tenantId: string;
  showId: string;
  name: string;
  plusOnes: number;
  status: string;
  createdAt: Date;
}

export interface Show {
  id: string;
  tenantId: string;
  title: string;
  date: Date;
  capacity: number;
  ticketPrice: number;
  lineup: LineupEntry[];
  reservations: Reservation[];
  guestEntries: GuestEntry[];
}

export interface TenantWithShows extends Tenant {
  shows: Show[];
}

export interface TenantWithCounts extends Tenant {
  counts: { shows: number; reservations: number; guestEntries: number };
}

// ---------- Helpers de mapeo ----------

function rowToTenant(r: Record<string, unknown>): Tenant {
  return {
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    city: r.city as string,
    description: r.description as string,
    accentColor: r.accentColor as string,
    amenities: String(r.amenities ?? "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean),
    createdAt: new Date(r.createdAt as string),
  };
}

function rowToArtist(r: Record<string, unknown>): Artist {
  return {
    id: r.id as string,
    tenantId: r.tenantId as string,
    name: r.name as string,
    genre: r.genre as string,
  };
}

function rowToReservation(r: Record<string, unknown>): Reservation {
  return {
    id: r.id as string,
    tenantId: r.tenantId as string,
    showId: r.showId as string,
    customerName: r.customerName as string,
    customerPhone: r.customerPhone as string,
    quantity: r.quantity as number,
    status: r.status as string,
    createdAt: new Date(r.createdAt as string),
  };
}

function rowToGuest(r: Record<string, unknown>): GuestEntry {
  return {
    id: r.id as string,
    tenantId: r.tenantId as string,
    showId: r.showId as string,
    name: r.name as string,
    plusOnes: r.plusOnes as number,
    status: r.status as string,
    createdAt: new Date(r.createdAt as string),
  };
}

function loadLineup(showId: string): LineupEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT sa.id, sa.showId, sa.artistId, sa.slotTime, a.id as a_id, a.tenantId as a_tenantId, a.name as a_name, a.genre as a_genre
       FROM ShowArtist sa JOIN Artist a ON a.id = sa.artistId
       WHERE sa.showId = ?`
    )
    .all(showId);
  return rows.map((r) => ({
    id: r.id as string,
    showId: r.showId as string,
    artistId: r.artistId as string,
    slotTime: (r.slotTime as string) ?? null,
    artist: {
      id: r.a_id as string,
      tenantId: r.a_tenantId as string,
      name: r.a_name as string,
      genre: r.a_genre as string,
    },
  }));
}

function loadShow(showRow: Record<string, unknown>, opts?: { withReservations?: boolean; withGuests?: boolean }): Show {
  const db = getDb();
  const id = showRow.id as string;
  const reservations = opts?.withReservations
    ? db.prepare(`SELECT * FROM Reservation WHERE showId = ? ORDER BY createdAt DESC`).all(id).map(rowToReservation)
    : [];
  const guestEntries = opts?.withGuests
    ? db.prepare(`SELECT * FROM GuestListEntry WHERE showId = ? ORDER BY createdAt DESC`).all(id).map(rowToGuest)
    : [];
  return {
    id,
    tenantId: showRow.tenantId as string,
    title: showRow.title as string,
    date: new Date(showRow.date as string),
    capacity: showRow.capacity as number,
    ticketPrice: showRow.ticketPrice as number,
    lineup: loadLineup(id),
    reservations,
    guestEntries,
  };
}

// ---------- API pública ----------

export function listTenantsWithNextShow(): TenantWithShows[] {
  const db = getDb();
  const tenants = db.prepare(`SELECT * FROM Tenant ORDER BY name ASC`).all().map(rowToTenant);
  const nowIso = new Date().toISOString();
  return tenants.map((t) => {
    const showRow = db
      .prepare(`SELECT * FROM Show WHERE tenantId = ? AND date >= ? ORDER BY date ASC LIMIT 1`)
      .get(t.id, nowIso);
    return { ...t, shows: showRow ? [loadShow(showRow)] : [] };
  });
}

export interface UpcomingShow {
  show: Show;
  tenant: Tenant;
}

export function listUpcomingShowsAll(opts: { limit?: number; tenantSlug?: string } = {}): UpcomingShow[] {
  const db = getDb();
  const nowIso = new Date().toISOString();
  let query = `SELECT s.*, t.id as t_id FROM Show s JOIN Tenant t ON t.id = s.tenantId WHERE s.date >= ?`;
  const params: (string | number)[] = [nowIso];
  if (opts.tenantSlug) {
    query += ` AND t.slug = ?`;
    params.push(opts.tenantSlug);
  }
  query += ` ORDER BY s.date ASC`;
  if (opts.limit) {
    query += ` LIMIT ?`;
    params.push(opts.limit);
  }
  const rows = db.prepare(query).all(...params);
  const tenantCache = new Map<string, Tenant>();
  return rows.map((r) => {
    let tenant = tenantCache.get(r.t_id as string);
    if (!tenant) {
      const tRow = db.prepare(`SELECT * FROM Tenant WHERE id = ?`).get(r.t_id as string)!;
      tenant = rowToTenant(tRow);
      tenantCache.set(tenant.id, tenant);
    }
    return { show: loadShow(r), tenant };
  });
}

export function getTenantBySlug(slug: string): Tenant | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM Tenant WHERE slug = ?`).get(slug);
  return row ? rowToTenant(row) : null;
}

export function getTenantWithShows(
  slug: string,
  opts: { withReservations?: boolean; withGuests?: boolean } = {}
): TenantWithShows | null {
  const db = getDb();
  const tRow = db.prepare(`SELECT * FROM Tenant WHERE slug = ?`).get(slug);
  if (!tRow) return null;
  const tenant = rowToTenant(tRow);
  const showRows = db.prepare(`SELECT * FROM Show WHERE tenantId = ? ORDER BY date ASC`).all(tenant.id);
  const shows = showRows.map((s) => loadShow(s, opts));
  return { ...tenant, shows };
}

export function getShowWithLineup(showId: string): Show | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM Show WHERE id = ?`).get(showId);
  return row ? loadShow(row) : null;
}

export function listTenantsWithCounts(): TenantWithCounts[] {
  const db = getDb();
  const tenants = db.prepare(`SELECT * FROM Tenant ORDER BY createdAt DESC`).all().map(rowToTenant);
  return tenants.map((t) => {
    const shows = (db.prepare(`SELECT COUNT(*) as c FROM Show WHERE tenantId = ?`).get(t.id) as { c: number }).c;
    const reservations = (
      db.prepare(`SELECT COUNT(*) as c FROM Reservation WHERE tenantId = ?`).get(t.id) as { c: number }
    ).c;
    const guestEntries = (
      db.prepare(`SELECT COUNT(*) as c FROM GuestListEntry WHERE tenantId = ?`).get(t.id) as { c: number }
    ).c;
    return { ...t, counts: { shows, reservations, guestEntries } };
  });
}

export function createTenant(input: {
  name: string;
  city: string;
  description: string;
  accentColor: string;
  amenities?: string[];
}): Tenant {
  const db = getDb();
  const baseSlug = input.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let slug = baseSlug;
  let i = 1;
  while (db.prepare(`SELECT id FROM Tenant WHERE slug = ?`).get(slug)) {
    slug = `${baseSlug}-${i++}`;
  }
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const amenities = input.amenities?.length ? input.amenities : ["Bailable", "Bar"];
  db.prepare(
    `INSERT INTO Tenant (id, slug, name, city, description, accentColor, amenities, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, slug, input.name, input.city, input.description, input.accentColor, amenities.join(","), createdAt);
  return {
    id,
    slug,
    name: input.name,
    city: input.city,
    description: input.description,
    accentColor: input.accentColor,
    amenities,
    createdAt: new Date(createdAt),
  };
}

export function createShowWithArtists(input: {
  tenantId: string;
  title: string;
  date: Date;
  capacity: number;
  ticketPrice: number;
  artistNames: string[];
  genre?: string;
}): Show {
  const db = getDb();
  const showId = randomUUID();
  db.prepare(
    `INSERT INTO Show (id, tenantId, title, date, capacity, ticketPrice) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(showId, input.tenantId, input.title, input.date.toISOString(), input.capacity, input.ticketPrice);

  for (const name of input.artistNames) {
    let artistRow = db
      .prepare(`SELECT * FROM Artist WHERE tenantId = ? AND name = ?`)
      .get(input.tenantId, name);
    let artistId: string;
    if (artistRow) {
      artistId = artistRow.id as string;
      if (input.genre) {
        db.prepare(`UPDATE Artist SET genre = ? WHERE id = ?`).run(input.genre, artistId);
      }
    } else {
      artistId = randomUUID();
      db.prepare(`INSERT INTO Artist (id, tenantId, name, genre) VALUES (?, ?, ?, ?)`).run(
        artistId,
        input.tenantId,
        name,
        input.genre || "Cumbia"
      );
    }
    db.prepare(`INSERT INTO ShowArtist (id, showId, artistId, slotTime) VALUES (?, ?, ?, ?)`).run(
      randomUUID(),
      showId,
      artistId,
      null
    );
  }

  return getShowWithLineup(showId)!;
}

export function createReservation(input: {
  tenantId: string;
  showId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
}): Reservation {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO Reservation (id, tenantId, showId, customerName, customerPhone, quantity, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, 'confirmada', ?)`
  ).run(id, input.tenantId, input.showId, input.customerName, input.customerPhone, input.quantity, createdAt);
  return {
    id,
    tenantId: input.tenantId,
    showId: input.showId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    quantity: input.quantity,
    status: "confirmada",
    createdAt: new Date(createdAt),
  };
}

export function createGuest(input: {
  tenantId: string;
  showId: string;
  name: string;
  plusOnes: number;
}): GuestEntry {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO GuestListEntry (id, tenantId, showId, name, plusOnes, status, createdAt) VALUES (?, ?, ?, ?, ?, 'pendiente', ?)`
  ).run(id, input.tenantId, input.showId, input.name, input.plusOnes, createdAt);
  return {
    id,
    tenantId: input.tenantId,
    showId: input.showId,
    name: input.name,
    plusOnes: input.plusOnes,
    status: "pendiente",
    createdAt: new Date(createdAt),
  };
}

export function updateGuestStatus(guestId: string, status: string): void {
  const db = getDb();
  db.prepare(`UPDATE GuestListEntry SET status = ? WHERE id = ?`).run(status, guestId);
}

export function seedIfEmpty(seedFn: () => void) {
  const db = getDb();
  const count = (db.prepare(`SELECT COUNT(*) as c FROM Tenant`).get() as { c: number }).c;
  if (count === 0) seedFn();
}

export function resetAndSeed(seedFn: (helpers: typeof seedHelpers) => void) {
  const db = getDb();
  db.exec(
    `DELETE FROM Reservation; DELETE FROM GuestListEntry; DELETE FROM ShowArtist; DELETE FROM Show; DELETE FROM Artist; DELETE FROM User; DELETE FROM Tenant;`
  );
  seedFn(seedHelpers);
}

const seedHelpers = {
  createTenant,
  createShowWithArtists,
  createReservation,
  createGuest,
  addUser(tenantId: string, name: string, email: string, role: string) {
    const db = getDb();
    db.prepare(`INSERT INTO User (id, tenantId, name, email, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)`).run(
      randomUUID(),
      tenantId,
      name,
      email,
      role,
      new Date().toISOString()
    );
  },
};
