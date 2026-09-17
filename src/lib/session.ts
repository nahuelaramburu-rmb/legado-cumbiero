import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import type { PermissionKey, Role } from "./api-types";

export const ACCESS_COOKIE = "legado_access";
export const REFRESH_COOKIE = "legado_refresh";

export const ACCESS_MAX_AGE = 60 * 15; // 15 min, igual que el access token
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 días, igual que el refresh token

function accessSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("Falta JWT_ACCESS_SECRET");
  return new TextEncoder().encode(secret);
}

export interface Session {
  id: string;
  role: Role;
  tenantId: string | null;
  tenantSlug: string | null;
  permissions: PermissionKey[];
}

/** Sólo lectura — usable desde Server Components. No refresca el token (eso lo hace middleware.ts). */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, accessSecret());
    return {
      id: payload.sub as string,
      role: payload.role as Role,
      tenantId: (payload.tenantId as string | null) ?? null,
      tenantSlug: (payload.tenantSlug as string | null) ?? null,
      permissions: (payload.permissions as PermissionKey[]) ?? [],
    };
  } catch {
    return null;
  }
}

/**
 * Redirige a /login si no hay sesión, o a la home si el rol no alcanza.
 * `tenantSlug`, si se pasa, exige que coincida con el tenant de la sesión
 * (salvo SUPER_ADMIN, que siempre pasa) — mismo criterio que TenantScopeGuard
 * del lado de la API.
 */
export async function requireRole(roles: Role[], opts?: { tenantSlug?: string }): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!roles.includes(session.role)) redirect("/");

  if (opts?.tenantSlug && session.role !== "SUPER_ADMIN" && session.tenantSlug !== opts.tenantSlug) {
    redirect("/");
  }

  return session;
}

/** Para Server Actions/Components que necesitan pegarle a la API como el usuario logueado. */
export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}
