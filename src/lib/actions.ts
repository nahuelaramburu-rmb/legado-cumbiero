"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as db from "@/lib/db";

export async function createReservationAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const showId = String(formData.get("showId"));
  const customerName = String(formData.get("customerName") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const quantity = Math.max(1, Number(formData.get("quantity") || 1));

  if (!customerName || !customerPhone) {
    throw new Error("Nombre y WhatsApp son obligatorios");
  }

  const tenant = db.getTenantBySlug(tenantSlug);
  if (!tenant) throw new Error("Boliche no encontrado");

  db.createReservation({
    tenantId: tenant.id,
    showId,
    customerName,
    customerPhone,
    quantity,
  });

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

  const tenant = db.getTenantBySlug(tenantSlug);
  if (!tenant) throw new Error("Boliche no encontrado");

  db.createGuest({ tenantId: tenant.id, showId, name, plusOnes });

  revalidatePath(`/${tenantSlug}/admin`);
}

export async function updateGuestStatusAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug"));
  const guestId = String(formData.get("guestId"));
  const status = String(formData.get("status"));

  db.updateGuestStatus(guestId, status);

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

  const tenant = db.getTenantBySlug(tenantSlug);
  if (!tenant) throw new Error("Boliche no encontrado");

  db.createShowWithArtists({
    tenantId: tenant.id,
    title,
    date: new Date(dateStr),
    capacity,
    ticketPrice,
    artistNames,
  });

  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/admin`);
}

export async function createTenantAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const accentColor = String(formData.get("accentColor") || "#E9376F");
  const amenities = String(formData.get("amenities") || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (!name || !city) throw new Error("Nombre y ciudad son obligatorios");

  db.createTenant({ name, city, description, accentColor, amenities });

  revalidatePath("/");
  revalidatePath("/master");
}
