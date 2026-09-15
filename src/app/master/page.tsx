import Link from "next/link";
import * as db from "@/lib/db";
import { TopNav } from "@/components/TopNav";
import { createTenantAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function MasterPage() {
  const tenants = db.listTenantsWithCounts();

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl px-6 py-14">
        <p className="text-sm text-cumbia-gold">Plataforma</p>
        <h1 className="mb-8 text-3xl font-black text-cumbia-cream">
          Panel maestro — todos los boliches
        </h1>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-cumbia-cream/90">
            Dar de alta un nuevo boliche (tenant)
          </h2>
          <form action={createTenantAction} className="card grid gap-3 p-6 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Nombre del boliche"
              required
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta"
            />
            <input
              name="city"
              placeholder="Ciudad"
              required
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta"
            />
            <input
              name="description"
              placeholder="Descripción breve"
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta sm:col-span-2"
            />
            <input
              name="amenities"
              placeholder="Amenities separados por coma (ej: Bailable, Bar, Estacionamiento)"
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta sm:col-span-2"
            />
            <input
              type="color"
              name="accentColor"
              defaultValue="#E9376F"
              className="h-11 w-20 rounded-lg border border-white/10 bg-black/30"
            />
            <button type="submit" className="btn-primary">
              Crear boliche
            </button>
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
