/**
 * Formas de datos devueltas por la API (api/README.md). Reflejan los
 * modelos de Prisma tal como llegan serializados en JSON (fechas como
 * string ISO, enums como string).
 */

export type Role = "SUPER_ADMIN" | "TENANT_ADMIN" | "TENANT_STAFF" | "CUSTOMER";

export type PermissionKey = "SHOWS_MANAGE" | "RESERVATIONS_MANAGE" | "GUEST_LIST_MANAGE" | "TENANT_SETTINGS_MANAGE";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string | null;
  tenantSlug: string | null;
  permissions: PermissionKey[];
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  city: string;
  description: string;
  accentColor: string;
  amenities: string[];
  createdAt: string;
}

export interface TenantWithShows extends Tenant {
  shows: Show[];
}

export interface TenantWithCounts extends Tenant {
  counts: { shows: number; reservations: number; guestEntries: number };
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

export interface Show {
  id: string;
  tenantId: string;
  title: string;
  date: string;
  capacity: number;
  ticketPrice: number;
  lineup: LineupEntry[];
}

export interface ShowWithTenant extends Show {
  tenant: Tenant;
}

/** Shape de GET /tenants/:tenantSlug/shows — cupo vendido, sin datos de clientes. */
export interface ShowWithAvailability extends Show {
  reservedCount: number;
}

export type GuestStatus = "pendiente" | "confirmado" | "ingreso";

export interface GuestEntry {
  id: string;
  tenantId: string;
  showId: string;
  name: string;
  plusOnes: number;
  status: GuestStatus;
  createdAt: string;
}

export type ReservationStatus = "confirmada" | "cancelada";

export interface Reservation {
  id: string;
  tenantId: string;
  showId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  status: ReservationStatus;
  createdAt: string;
  show?: { id: string; title: string; date: string };
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}
