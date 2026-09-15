import Link from "next/link";
import * as db from "@/lib/db";
import { TopNav } from "@/components/TopNav";
import { EventCard } from "@/components/EventCard";
import { TenantCard } from "@/components/TenantCard";
import { DiscoScene } from "@/components/DiscoScene";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const upcoming = db.listUpcomingShowsAll({ limit: 4 });
  const tenants = db.listTenantsWithNextShow();

  return (
    <>
      <TopNav />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-black px-6 py-20">
          <DiscoScene tint="#FF2E93" variant="hero" />
          <div className="relative mx-auto max-w-6xl">
            <p className="badge mb-4 inline-flex items-center gap-1 bg-cumbia-yellow/20 text-cumbia-yellow">
              🎵 90&apos;s - 2000&apos;s
            </p>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.05] text-cumbia-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-5xl">
              La cumbia de siempre, <span className="text-cumbia-pink">en la fiesta de hoy</span> 👑
            </h1>
            <p className="mt-4 max-w-xl text-cumbia-cream/80">
              Legado Cumbiero conecta boliches: entradas, listas de invitados, usuarios
              y line-ups — cada local con su propia identidad, todos en un solo lugar.
            </p>

            <form action="/eventos" className="card mt-8 flex flex-col gap-3 bg-black/40 p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-cumbia-cream/50">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cumbia-cream outline-none focus:border-cumbia-pink"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-cumbia-cream/50">Boliche</label>
                <select
                  name="tenant"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cumbia-cream outline-none focus:border-cumbia-pink"
                >
                  <option value="">Todos los boliches</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary sm:mt-5">
                🔍 Buscar
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cumbia-cream/90">Próximos eventos</h2>
            <Link href="/eventos" className="text-sm font-semibold text-cumbia-pink hover:underline">
              Ver todos →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="card p-6 text-cumbia-cream/60">Todavía no hay eventos cargados.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {upcoming.map(({ show, tenant }) => (
                <EventCard key={show.id} show={show} tenant={tenant} />
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cumbia-cream/90">Boliches en la plataforma</h2>
            <Link href="/boliches" className="text-sm font-semibold text-cumbia-pink hover:underline">
              Ver todos →
            </Link>
          </div>
          {tenants.length === 0 ? (
            <p className="card p-6 text-cumbia-cream/60">
              Todavía no hay boliches cargados. Entrá al{" "}
              <Link href="/master" className="underline">
                panel maestro
              </Link>{" "}
              para dar de alta el primero.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tenants.map((t) => (
                <TenantCard key={t.id} tenant={t} nextShowTitle={t.shows[0]?.title} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
