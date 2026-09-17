/**
 * Cliente HTTP hacia la API de Legado Cumbiero (NestJS + Postgres, ver
 * api/README.md). Reemplaza los imports directos de "@/lib/db": en vez de
 * leer SQLite en el mismo proceso, cada página/Server Action hace un fetch
 * server-to-server contra la API — típicamente vía la red interna de
 * Docker (API_INTERNAL_URL), nunca desde el browser.
 */

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `API respondió ${status}`);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; accessToken?: string } = {},
): Promise<T> {
  const res = await fetch(`${API_INTERNAL_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.accessToken && { Authorization: `Bearer ${options.accessToken}` }),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data, typeof data?.message === "string" ? data.message : undefined);
  }

  return data as T;
}

export function apiGet<T>(path: string, accessToken?: string): Promise<T> {
  return request<T>(path, { accessToken });
}

export function apiPost<T>(path: string, body?: unknown, accessToken?: string): Promise<T> {
  return request<T>(path, { method: "POST", body, accessToken });
}

export function apiPatch<T>(path: string, body?: unknown, accessToken?: string): Promise<T> {
  return request<T>(path, { method: "PATCH", body, accessToken });
}

export function apiDelete<T>(path: string, accessToken?: string): Promise<T> {
  return request<T>(path, { method: "DELETE", accessToken });
}

/** Como apiGet, pero devuelve null en vez de tirar si la API respondió 404. */
export async function apiGetOrNull<T>(path: string, accessToken?: string): Promise<T | null> {
  try {
    return await apiGet<T>(path, accessToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
