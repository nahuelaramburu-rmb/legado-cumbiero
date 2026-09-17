/**
 * Formas de datos devueltas por la API (api/README.md). Reflejan los
 * modelos de Prisma tal como llegan serializados en JSON (fechas como
 * string ISO, enums como string).
 */

export type Role = "SUPER_ADMIN" | "TENANT_ADMIN" | "TENANT_STAFF" | "CUSTOMER";

export type PermissionKey = "SHOWS_MANAGE" | "RESERVATIONS_MANAGE" | "GUEST_LIST_MANAGE" | "TENANT_SETTINGS_MANAGE";

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  tenantId: string | null;
  tenantSlug: string | null;
  permissions: PermissionKey[];
  phoneAreaCode: string | null;
  phoneNumber: string | null;
  birthDate: string | null;
  provinceId: string | null;
  cityId: string | null;
  marketingOptIn: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  city: string;
  provinceId: string | null;
  cityId: string | null;
  description: string;
  accentColor: string;
  amenities: string[];
  logoUrl: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
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
  isActive: boolean;
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
  userId: string | null;
  customerName: string;
  customerPhone: string;
  quantity: number;
  status: ReservationStatus;
  createdAt: string;
  show?: { id: string; title: string; date: string };
  tenant?: { slug: string; name: string; accentColor: string };
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface City {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  cities: City[];
}

export interface LocationsResponse {
  provinces: Province[];
}
