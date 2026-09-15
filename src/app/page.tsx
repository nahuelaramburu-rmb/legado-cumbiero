import Link from "next/link";
import * as db from "@/lib/db";
import { TopNav } from "@/components/TopNav";
import { EventCard } from "@/components/EventCard";
import { TenantCard } from "@/components/TenantCard";
import { DiscoScene } from "@/components/DiscoScene";
import { CumbiaGear } from "@/components/CumbiaGear";
import { IconCalendar, IconChevronRight, IconCrown, IconMapPin, IconSearch } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const upcoming = db.listUpcomingShowsAll({ limit: 4 });
  const tenants = db.listTenantsWithNextShow();

  return (
    <>
      <TopNav />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-black">
          <div className="relative flex h-[380px] flex-col justify-center overflow-hidden sm:h-[440px] lg:h-[500px]">
            <DiscoScene tint="#FF2E93" variant="hero" />

            {/* arte de cassette + grabador, esquina inferior derecha (oculto en mobile) */}
            <CumbiaGear className="pointer-events-none absolute -right-4 bottom-2 hidden w-48 opacity-90 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] sm:block lg:w-56" />
            <span className="badge pointer-events-none absolute bottom-24 right-6 hidden -rotate-6 border border-dashed border-cumbia-cyan/60 bg-black/60 text-xs font-bold tracking-wide text-cumbia-cyan backdrop-blur-sm sm:inline-block lg:right-10">
              90&apos;S · 2000&apos;S
            </span>

            <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
              <h1 className="flex max-w-xl flex-wrap items-center gap-3 text-4xl font-black leading-[1.05] text-cumbia-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-5xl">
                La cumbia de siempre,
                <IconCrown size={30} className="text-cumbia-yellow drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
                <span className="text-cumbia-pink">en la fiesta de hoy</span>
              </h1>
              <p className="mt-4 max-w-xl text-cumbia-cream/80">
                Legado Cumbiero conecta boliches: entradas, listas de invitados, usuarios
                y line-ups — cada local con su propia identidad, todos en un solo lugar.
              </p>
            </div>
          </div>

          {/* barra de búsqueda flotante, se superpone al borde inferior del hero */}
          <div className="relative z-10 mx-auto -mt-8 max-w-6xl px-6 pb-10 sm:-mt-9">
            <form
              action="/eventos"
              className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-cumbia-night/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-md sm:flex-row sm:items-stretch"
            >
              <label className="relative flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 sm:border-r sm:border-white/10">
                <IconCalendar size={18} className="shrink-0 text-cumbia-pink" />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-cumbia-cream/50">
                    Fecha
                  </span>
                  <input
                    type="date"
                    name="fecha"
                    className="w-full appearance-none bg-transparent text-sm font-medium text-cumbia-cream outline-none"
                  />
                </span>
                <IconChevronRight size={16} className="hidden shrink-0 text-cumbia-cream/30 sm:block" />
              </label>

              <label className="relative flex flex-1 items-center gap-3 rounded-2xl px-4 py-3">
                <IconMapPin size={18} className="shrink-0 text-cumbia-pink" />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-cumbia-cream/50">
                    Boliche
                  </span>
                  <select
                    name="tenant"
                    className="w-full appearance-none bg-transparent text-sm font-medium text-cumbia-cream outline-none"
                  >
                    <option value="">Todos los boliches</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.slug}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </span>
                <IconChevronRight size={16} className="hidden shrink-0 text-cumbia-cream/30 sm:block" />
              </label>

              <button type="submit" className="btn-primary gap-2 sm:rounded-2xl sm:px-8">
                <IconSearch size={17} /> Buscar
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
