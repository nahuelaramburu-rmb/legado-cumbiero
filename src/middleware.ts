import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * Refresca el access token de forma transparente cuando está por vencer
 * (access token dura 15 min). Corre antes de cada página; si no hay sesión
 * o el refresh falla, simplemente no toca las cookies — requireRole()
 * del lado de cada página es quien decide si hace falta login.
 */

const ACCESS_COOKIE = "legado_access";
const REFRESH_COOKIE = "legado_refresh";
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

function accessSecret() {
  return new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
}

async function isAccessTokenValid(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, accessSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) return NextResponse.next();
  if (accessToken && (await isAccessTokenValid(accessToken))) return NextResponse.next();

  // Access token ausente/vencido pero hay refresh token: intentar rotarlo.
  try {
    const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001/api/v1";
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      const response = NextResponse.next();
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }

    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    const response = NextResponse.next();
    const common = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
    response.cookies.set(ACCESS_COOKIE, data.accessToken, { ...common, maxAge: ACCESS_MAX_AGE });
    response.cookies.set(REFRESH_COOKIE, data.refreshToken, { ...common, maxAge: REFRESH_MAX_AGE });
    return response;
  } catch {
    // API caída u otro error de red: seguir sin sesión antes que romper la request.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Todas las páginas, salvo assets estáticos/imágenes/Next internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
