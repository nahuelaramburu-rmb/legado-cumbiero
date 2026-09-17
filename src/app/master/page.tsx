import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import type { TenantWithCounts } from "@/lib/api-types";
import { TopNav } from "@/components/TopNav";
import { createTenantAction } from "@/lib/actions";
import { getAccessToken, requireRole } from "@/lib/session";
import { IconMapPin, IconPlus, IconSparkle } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function MasterPage() {
  await requireRole(["SUPER_ADMIN"]);
  const accessToken = await getAccessToken();
  const tenants = await apiGet<TenantWithCounts[]>("/tenants/with-counts", accessToken ?? undefined);

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-sm text-cumbia-gold">Plataforma</p>
        <h1 className="mb-8 text-3xl font-black text-cumbia-cream">
          Panel maestro — todos los boliches
        </h1>

        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <IconSparkle size={16} className="text-cumbia-yellow" />
            <h2 className="text-lg font-semibold text-cumbia-cream/90">
              Dar de alta un nuevo boliche
            </h2>
          </div>

          <form action={createTenantAction} className="card space-y-6 p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-cumbia-cream/70">Nombre del boliche</label>
                <input
                  name="name"
                  required
                  placeholder="Ej: El Túnel"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-cumbia-cream/70">Ciudad</label>
                <div className="relative">
                  <IconMapPin size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cumbia-cream/40" />
                  <input
                    name="city"
                    required
                    placeholder="Ej: La Plata"
                    className="w-full rounded-lg border border-white/10 bg-black/30 py-2.5 pl-10 pr-3.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-cumbia-cream/70">Descripción</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Una frase que resuma la onda del lugar"
                className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-cumbia-cream/70">Amenities</label>
              <input
                name="amenities"
                placeholder="Bailable, Bar, Estacionamiento"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
              />
              <p className="mt-1.5 text-xs text-cumbia-cream/40">Separados por coma — aparecen como chips en la página del boliche.</p>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <input
                type="color"
                name="accentColor"
                defaultValue="#E9376F"
                className="h-12 w-12 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-cumbia-cream">Color de marca</p>
                <p className="text-xs text-cumbia-cream/40">Tiñe los botones y acentos de la página pública del boliche.</p>
              </div>
            </div>

            <div className="flex justify-end border-t border-white/10 pt-6">
              <button type="submit" className="btn-primary gap-2 px-8">
                <IconPlus size={16} /> Crear boliche
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-cumbia-cream/90">
            Tenants activos ({tenants.length})
          </h2>
          <div className="space-y-3">
            {tenants.map((t) => (
              <div key={t.id} className="card flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-cumbia-cream">
                    {t.name}{" "}
                    <span className="text-sm font-normal text-cumbia-cream/50">
                      ({t.slug})
                    </span>
                  </p>
                  <p className="text-sm text-cumbia-cream/60">{t.city}</p>
                  <p className="mt-1 text-xs text-cumbia-cream/40">
                    {t.counts.shows} shows · {t.counts.reservations} reservas ·{" "}
                    {t.counts.guestEntries} en listas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/${t.slug}`} className="btn-secondary">
                    Ver público
                  </Link>
                  <Link href={`/${t.slug}/admin`} className="btn-primary">
                    Panel
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
