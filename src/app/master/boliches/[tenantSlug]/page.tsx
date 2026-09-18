import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet, apiGetOrNull } from "@/lib/api-client";
import type { LocationsResponse, Tenant } from "@/lib/api-types";
import { LocationSelect } from "@/components/LocationSelect";
import { setTenantActiveAction, updateTenantAction, updateTenantImagesAction } from "@/lib/master-actions";
import { IconArrowLeft } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function EditBolichePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const [tenant, { provinces }] = await Promise.all([
    apiGetOrNull<Tenant>(`/tenants/${tenantSlug}`),
    apiGet<LocationsResponse>("/locations"),
  ]);
  if (!tenant) notFound();

  return (
    <section>
      <Link
        href="/master/boliches"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-cumbia-cream/60 hover:text-cumbia-cream"
      >
        <IconArrowLeft size={14} /> Volver a boliches
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-cumbia-cream/90">
          Editar {tenant.name}
          {!tenant.isActive && <span className="badge ml-2 bg-red-500/20 text-xs text-red-300">Desactivado</span>}
        </h2>
        <div className="flex gap-2">
          <Link href={`/${tenant.slug}`} className="btn-secondary">
            Ver público
          </Link>
          <Link href={`/${tenant.slug}/admin`} className="btn-secondary">
            Panel del boliche
          </Link>
        </div>
      </div>

      <form action={updateTenantAction} className="card max-w-2xl space-y-6 p-6 sm:p-8">
        <input type="hidden" name="tenantSlug" value={tenant.slug} />

        <div>
          <label className="mb-1.5 block text-sm text-cumbia-cream/70">Nombre del boliche</label>
          <input
            name="name"
            required
            defaultValue={tenant.name}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
          />
        </div>

        <LocationSelect
          provinces={provinces}
          defaultProvinceId={tenant.provinceId ?? undefined}
          defaultCityId={tenant.cityId ?? undefined}
        />

        <div>
          <label className="mb-1.5 block text-sm text-cumbia-cream/70">Descripción</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={tenant.description}
            className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-cumbia-cream/70">Amenities</label>
          <input
            name="amenities"
            defaultValue={tenant.amenities.join(", ")}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
          />
          <p className="mt-1.5 text-xs text-cumbia-cream/40">Separados por coma — aparecen como chips en la página del boliche.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-cumbia-cream/70">Dirección</label>
          <input
            name="address"
            defaultValue={tenant.address ?? ""}
            placeholder="Ej: Calle 50 N° 1234"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
          />
          <p className="mt-1.5 text-xs text-cumbia-cream/40">Se usa para el link "Ver mapa" de la página pública.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Teléfono / WhatsApp de contacto</label>
            <input
              name="contactPhone"
              defaultValue={tenant.contactPhone ?? ""}
              placeholder="+54 221 1234567"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Instagram</label>
            <input
              name="instagram"
              defaultValue={tenant.instagram ?? ""}
              placeholder="@boliche"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Horario</label>
            <input
              name="openingHours"
              defaultValue={tenant.openingHours ?? ""}
              placeholder="Vie-Sáb 23:00 a 06:00"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Edad mínima</label>
            <input
              type="number"
              name="minAge"
              min={0}
              max={99}
              defaultValue={tenant.minAge ?? ""}
              placeholder="18"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <input type="color" name="accentColor" defaultValue={tenant.accentColor} className="h-12 w-12 shrink-0" />
          <div>
            <p className="text-sm font-medium text-cumbia-cream">Color de marca</p>
            <p className="text-xs text-cumbia-cream/40">Tiñe los botones y acentos de la página pública del boliche.</p>
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-6">
          <button type="submit" className="btn-primary px-8">
            Guardar cambios
          </button>
        </div>
      </form>

      <form
        action={updateTenantImagesAction}
        encType="multipart/form-data"
        className="card mt-6 max-w-2xl space-y-6 p-6 sm:p-8"
      >
        <input type="hidden" name="tenantSlug" value={tenant.slug} />
        <p className="font-medium text-cumbia-cream">Imágenes del boliche</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Logo (cuadrado)</label>
            <p className="mb-2 text-xs text-cumbia-cream/40">Se usa en las tarjetas y listados del boliche.</p>
            {tenant.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt="Logo actual"
                className="mb-2 h-20 w-20 rounded-xl border border-white/10 object-cover"
              />
            )}
            <input
              type="file"
              name="logo"
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm text-cumbia-cream/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-cumbia-cream file:transition hover:file:bg-white/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Foto de portada</label>
            <p className="mb-2 text-xs text-cumbia-cream/40">Se usa como fondo de la página pública del boliche.</p>
            {tenant.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.coverImageUrl}
                alt="Portada actual"
                className="mb-2 h-20 w-full rounded-xl border border-white/10 object-cover"
              />
            )}
            <input
              type="file"
              name="cover"
              accept="image/jpeg,image/png,image/webp"
              className="w-full text-sm text-cumbia-cream/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-cumbia-cream file:transition hover:file:bg-white/20"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-6">
          <button type="submit" className="btn-primary px-8">
            Subir imágenes
          </button>
        </div>
      </form>

      <div className="card mt-6 max-w-2xl p-6 sm:p-8">
        <p className="mb-1 font-medium text-cumbia-cream">
          {tenant.isActive ? "Desactivar boliche" : "Reactivar boliche"}
        </p>
        <p className="mb-4 text-sm text-cumbia-cream/50">
          {tenant.isActive
            ? "El boliche deja de verse en la app pública (home, /boliches, su propia página). No se borra ningún dato y se puede reactivar en cualquier momento."
            : "El boliche vuelve a aparecer en la app pública."}
        </p>
        <form action={setTenantActiveAction}>
          <input type="hidden" name="tenantSlug" value={tenant.slug} />
          <input type="hidden" name="isActive" value={(!tenant.isActive).toString()} />
          <button
            type="submit"
            className={tenant.isActive ? "btn-secondary border-red-500/40 text-red-300 hover:bg-red-500/10" : "btn-primary"}
          >
            {tenant.isActive ? "Desactivar boliche" : "Reactivar boliche"}
          </button>
        </form>
      </div>
    </section>
  );
}
