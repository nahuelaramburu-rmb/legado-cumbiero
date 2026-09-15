import Image from "next/image";
import Link from "next/link";
import * as db from "@/lib/db";
import { TopNav } from "@/components/TopNav";
import { EventCard } from "@/components/EventCard";
import { TenantCard } from "@/components/TenantCard";
import { IconCalendar, IconChevronRight, IconMapPin, IconSearch } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const upcoming = db.listUpcomingShowsAll({ limit: 4 });
  const tenants = db.listTenantsWithNextShow();

  return (
    <>
      <TopNav showBrand={false} />
      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-black">
          <div className="pointer-events-none absolute left-4 top-0 z-20 w-28 drop-shadow-[0_10px_26px_rgba(0,0,0,0.65)] sm:left-6 sm:w-40 lg:w-56 xl:w-64">
            <Image src="/logo-badge.png" alt="Legado Cumbiero" width={1254} height={1254} className="h-auto w-full" priority />
          </div>

          <div className="relative flex h-[380px] flex-col justify-end overflow-hidden sm:h-[440px] lg:h-[500px]">
            <Image
              src="/hero-banner.png"
              alt="La cumbia de siempre, en la fiesta de hoy — Legado Cumbiero, 90's y 2000's"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_70%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
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
