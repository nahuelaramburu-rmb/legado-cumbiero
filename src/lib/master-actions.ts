"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiPatch, apiPatchMultipart, apiPost, ApiError } from "@/lib/api-client";
import { getAccessToken } from "@/lib/session";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && typeof err.body === "object" && err.body && "message" in err.body) {
    const msg = (err.body as { message: unknown }).message;
    return typeof msg === "string" ? msg : fallback;
  }
  return fallback;
}

function readTenantFields(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const provinceId = String(formData.get("provinceId") || "");
  const cityId = String(formData.get("cityId") || "");
  const description = String(formData.get("description") || "").trim();
  const accentColor = String(formData.get("accentColor") || "#E9376F");
  const amenities = String(formData.get("amenities") || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  const address = String(formData.get("address") || "").trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const openingHours = String(formData.get("openingHours") || "").trim();
  const minAgeRaw = String(formData.get("minAge") || "").trim();

  if (!name || !provinceId || !cityId) {
    throw new Error("Nombre, provincia y ciudad son obligatorios");
  }

  return {
    name,
    provinceId,
    cityId,
    description,
    accentColor,
    amenities,
    // "" en vez de undefined: así también sirve para BORRAR el campo al
    // editar (updateTenantAction hace un PATCH parcial que sólo aplica
    // los campos presentes en el body).
    address,
    contactPhone,
    instagram,
    openingHours,
    minAge: minAgeRaw ? Number(minAgeRaw) : null,
  };
}

export async function createTenantWithLocationAction(formData: FormData) {
  const fields = readTenantFields(formData);

  const accessToken = await getAccessToken();
  try {
    await apiPost("/tenants", fields, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo crear el boliche"));
  }

  revalidatePath("/");
  revalidatePath("/master/boliches");
  redirect("/master/boliches");
}

export async function updateTenantAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const fields = readTenantFields(formData);

  const accessToken = await getAccessToken();
  try {
    await apiPatch(`/tenants/${tenantSlug}`, fields, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo actualizar el boliche"));
  }

  revalidatePath("/");
  revalidatePath("/master/boliches");
  revalidatePath(`/${tenantSlug}`);
}

export async function updateTenantImagesAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const logo = formData.get("logo");
  const cover = formData.get("cover");

  const hasLogo = logo instanceof File && logo.size > 0;
  const hasCover = cover instanceof File && cover.size > 0;
  if (!hasLogo && !hasCover) throw new Error("Elegí al menos una imagen para subir");

  const upload = new FormData();
  if (hasLogo) upload.set("logo", logo);
  if (hasCover) upload.set("cover", cover);

  const accessToken = await getAccessToken();
  try {
    await apiPatchMultipart(`/tenants/${tenantSlug}/images`, upload, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo subir la imagen"));
  }

  revalidatePath("/");
  revalidatePath("/master/boliches");
  revalidatePath(`/master/boliches/${tenantSlug}`);
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
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!tenantSlug || !firstName || !lastName || !email || !password) {
    throw new Error("Todos los campos son obligatorios");
  }

  const accessToken = await getAccessToken();
  try {
    await apiPost(
      "/admin/users/tenant-admin",
      { tenantSlug, firstName, lastName, email, password },
      accessToken ?? undefined,
    );
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
