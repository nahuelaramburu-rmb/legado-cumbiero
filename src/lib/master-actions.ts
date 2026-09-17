"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiPatch, apiPost, ApiError } from "@/lib/api-client";
import { getAccessToken } from "@/lib/session";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && typeof err.body === "object" && err.body && "message" in err.body) {
    const msg = (err.body as { message: unknown }).message;
    return typeof msg === "string" ? msg : fallback;
  }
  return fallback;
}

export async function createTenantWithLocationAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const provinceId = String(formData.get("provinceId") || "");
  const cityId = String(formData.get("cityId") || "");
  const description = String(formData.get("description") || "").trim();
  const accentColor = String(formData.get("accentColor") || "#E9376F");
  const amenities = String(formData.get("amenities") || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!name || !provinceId || !cityId) {
    throw new Error("Nombre, provincia y ciudad son obligatorios");
  }

  const accessToken = await getAccessToken();
  try {
    await apiPost(
      "/tenants",
      { name, provinceId, cityId, description, accentColor, amenities },
      accessToken ?? undefined,
    );
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo crear el boliche"));
  }

  revalidatePath("/");
  revalidatePath("/master/boliches");
  redirect("/master/boliches");
}

export async function updateTenantAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const name = String(formData.get("name") || "").trim();
  const provinceId = String(formData.get("provinceId") || "");
  const cityId = String(formData.get("cityId") || "");
  const description = String(formData.get("description") || "").trim();
  const accentColor = String(formData.get("accentColor") || "#E9376F");
  const amenities = String(formData.get("amenities") || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!name || !provinceId || !cityId) {
    throw new Error("Nombre, provincia y ciudad son obligatorios");
  }

  const accessToken = await getAccessToken();
  try {
    await apiPatch(
      `/tenants/${tenantSlug}`,
      { name, provinceId, cityId, description, accentColor, amenities },
      accessToken ?? undefined,
    );
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo actualizar el boliche"));
  }

  revalidatePath("/");
  revalidatePath("/master/boliches");
  revalidatePath(`/${tenantSlug}`);
}

export async function setTenantActiveAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const isActive = String(formData.get("isActive")) === "true";

  const accessToken = await getAccessToken();
  try {
    await apiPatch(`/tenants/${tenantSlug}/status`, { isActive }, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo cambiar el estado del boliche"));
  }

  revalidatePath("/");
  revalidatePath("/master/boliches");
  revalidatePath(`/${tenantSlug}`);
}

export async function createTenantAdminAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!tenantSlug || !name || !email || !password) {
    throw new Error("Todos los campos son obligatorios");
  }

  const accessToken = await getAccessToken();
  try {
    await apiPost("/admin/users/tenant-admin", { tenantSlug, name, email, password }, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo crear el admin del boliche"));
  }

  revalidatePath("/master/usuarios");
}

export async function setUserActiveAction(formData: FormData) {
  const userId = String(formData.get("userId"));
  const isActive = String(formData.get("isActive")) === "true";

  const accessToken = await getAccessToken();
  try {
    await apiPatch(`/admin/users/${userId}/active`, { isActive }, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo cambiar el estado del usuario"));
  }

  revalidatePath("/master/usuarios");
}
