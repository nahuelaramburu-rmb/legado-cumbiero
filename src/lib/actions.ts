"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiDelete, apiPatch, apiPost, ApiError } from "@/lib/api-client";
import { getAccessToken } from "@/lib/session";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && typeof err.body === "object" && err.body && "message" in err.body) {
    const msg = (err.body as { message: unknown }).message;
    return typeof msg === "string" ? msg : fallback;
  }
  return fallback;
}

export async function createReservationAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const showId = String(formData.get("showId"));
  const customerName = String(formData.get("customerName") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const quantity = Math.max(1, Number(formData.get("quantity") || 1));

  if (!customerName || !customerPhone) {
    throw new Error("Nombre y WhatsApp son obligatorios");
  }

  const accessToken = await getAccessToken();
  try {
    await apiPost(
      `/tenants/${tenantSlug}/shows/${showId}/reservations`,
      { customerName, customerPhone, quantity },
      accessToken ?? undefined,
    );
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo confirmar la reserva"));
  }

  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/admin`);
  redirect(`/${tenantSlug}?reservado=1`);
}

export async function addGuestAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const showId = String(formData.get("showId"));
  const name = String(formData.get("name") || "").trim();
  const plusOnes = Math.max(0, Number(formData.get("plusOnes") || 0));

  if (!name) throw new Error("Falta el nombre del invitado");

  const accessToken = await getAccessToken();
  try {
    await apiPost(`/tenants/${tenantSlug}/shows/${showId}/guests`, { name, plusOnes }, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo agregar el invitado"));
  }

  revalidatePath(`/${tenantSlug}/admin`);
}

export async function updateGuestStatusAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const guestId = String(formData.get("guestId"));
  const status = String(formData.get("status"));

  const accessToken = await getAccessToken();
  try {
    await apiPatch(`/tenants/${tenantSlug}/guests/${guestId}`, { status }, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo actualizar el invitado"));
  }

  revalidatePath(`/${tenantSlug}/admin`);
}

export async function createShowAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const title = String(formData.get("title") || "").trim();
  const dateStr = String(formData.get("date") || "");
  const capacity = Math.max(1, Number(formData.get("capacity") || 200));
  const ticketPrice = Math.max(0, Number(formData.get("ticketPrice") || 0));
  const artistNames = String(formData.get("artists") || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!title || !dateStr) throw new Error("Título y fecha son obligatorios");

  const accessToken = await getAccessToken();
  try {
    await apiPost(
      `/tenants/${tenantSlug}/shows`,
      { title, date: new Date(dateStr).toISOString(), capacity, ticketPrice, artistNames },
      accessToken ?? undefined,
    );
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo crear el show"));
  }

  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/admin`);
}

export async function setShowActiveAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const showId = String(formData.get("showId"));
  const isActive = String(formData.get("isActive")) === "true";

  const accessToken = await getAccessToken();
  try {
    await apiPatch(`/tenants/${tenantSlug}/shows/${showId}`, { isActive }, accessToken ?? undefined);
  } catch (err) {
    throw new Error(apiErrorMessage(err, "No se pudo cambiar el estado del show"));
  }

  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/admin`);
}

export async function toggleFavoriteAction(tenantSlug: string, favorite: boolean) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("No autenticado");

  if (favorite) {
    await apiPost(`/favorites/${tenantSlug}`, undefined, accessToken);
  } else {
    await apiDelete(`/favorites/${tenantSlug}`, accessToken);
  }

  revalidatePath(`/${tenantSlug}`);
  revalidatePath("/perfil");
}
