import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { apiGetOrNull } from "@/lib/api-client";
import type { Show, Tenant } from "@/lib/api-types";
import { TopNav } from "@/components/TopNav";
import { IconArrowLeft } from "@/components/icons";
import { updateShowDetailsAction, updateShowImageAction } from "@/lib/actions";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditShowPage({
  params,
}: {
  params: Promise<{ tenant: string; showId: string }>;
}) {
  const { tenant: tenantSlug, showId } = await params;
  const session = await requireRole(["SUPER_ADMIN", "TENANT_ADMIN", "TENANT_STAFF"], { tenantSlug });
  const canManageShows = session.role !== "TENANT_STAFF" || session.permissions.includes("SHOWS_MANAGE");
  if (!canManageShows) redirect(`/${tenantSlug}/admin`);

  const [show, tenant] = await Promise.all([
    apiGetOrNull<Show>(`/shows/${showId}`),
    apiGetOrNull<Tenant>(`/tenants/${tenantSlug}`),
  ]);
  if (!show || !tenant) notFound();

  const artistNames = show.lineup.map((l) => l.artist.name).join(", ");
  const genre = show.lineup[0]?.artist.genre ?? "";

  return (
    <>
      <TopNav tenantName={tenant.name} tenantSlug={tenant.slug} />
      <main className="mx-auto max-w-2xl px-6 py-14">
        <Link
          href={`/${tenantSlug}/admin`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-cumbia-cream/60 hover:text-cumbia-cream"
        >
          <IconArrowLeft size={14} /> Volver al panel
        </Link>

        <h1 className="mb-8 text-2xl font-black text-cumbia-cream">Editar show</h1>

        <form action={updateShowDetailsAction} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          <input type="hidden" name="tenantSlug" value={tenantSlug} />
          <input type="hidden" name="showId" value={show.id} />

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Título</label>
            <input
              name="title"
              required
              defaultValue={show.title}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none focus:border-cumbia-magenta"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Fecha y hora</label>
            <input
              type="datetime-local"
              name="date"
              required
              defaultValue={toDatetimeLocal(show.date)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none focus:border-cumbia-magenta"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Género</label>
            <input
              name="genre"
              defaultValue={genre}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none focus:border-cumbia-magenta"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Artistas / line-up</label>
            <input
              name="artists"
              defaultValue={artistNames}
              placeholder="Separados por coma"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none focus:border-cumbia-magenta"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Capacidad</label>
            <input
              type="number"
              name="capacity"
              min={1}
              defaultValue={show.capacity}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none focus:border-cumbia-magenta"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Precio entrada</label>
            <input
              type="number"
              name="ticketPrice"
              min={0}
              defaultValue={show.ticketPrice}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none focus:border-cumbia-magenta"
            />
          </div>

          <div className="flex justify-end border-t border-white/10 pt-6 sm:col-span-2">
            <button type="submit" className="btn-primary px-8">
              Guardar cambios
            </button>
          </div>
        </form>

        <form
          action={updateShowImageAction}
          encType="multipart/form-data"
          className="card mt-6 space-y-4 p-6 sm:p-8"
        >
          <input type="hidden" name="tenantSlug" value={tenantSlug} />
          <input type="hidden" name="showId" value={show.id} />
          <p className="font-medium text-cumbia-cream">Imagen del evento</p>
          <p className="-mt-2 text-xs text-cumbia-cream/40">
            Se usa en las tarjetas de eventos y en la página del boliche.
          </p>
          {show.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={show.imageUrl}
              alt="Imagen actual"
              className="h-32 w-full rounded-xl border border-white/10 object-cover"
            />
          )}
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            className="w-full text-sm text-cumbia-cream/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-cumbia-cream file:transition hover:file:bg-white/20"
          />
          <div className="flex justify-end border-t border-white/10 pt-6">
            <button type="submit" className="btn-primary px-8">
              Subir imagen
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
