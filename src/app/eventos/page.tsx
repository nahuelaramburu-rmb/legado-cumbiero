import Link from "next/link";
import * as db from "@/lib/db";
import { TopNav } from "@/components/TopNav";
import { EventCard } from "@/components/EventCard";
import { IconSearch } from "@/components/icons";

export const dynamic = "force-dynamic";

const RANGE_LABELS: Record<string, string> = {
  hoy: "Hoy",
  semana: "Esta semana",
  mes: "Este mes",
};

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; tenant?: string; rango?: string }>;
}) {
  const { fecha, tenant, rango } = await searchParams;
  const tenants = db.listTenantsWithNextShow();

  let upcoming = db.listUpcomingShowsAll({ tenantSlug: tenant || undefined });
  if (fecha) {
    upcoming = upcoming.filter((u) => u.show.date.toISOString().slice(0, 10) === fecha);
  }
  if (rango && rango !== "todos") {
    const now = new Date();
    const end = new Date(now);
    if (rango === "hoy") end.setHours(23, 59, 59, 999);
    if (rango === "semana") end.setDate(end.getDate() + 7);
    if (rango === "mes") end.setMonth(end.getMonth() + 1);
    upcoming = upcoming.filter((u) => u.show.date <= end);
  }

  const chipHref = (r: string) => {
    const params = new URLSearchParams();
    if (fecha) params.set("fecha", fecha);
    if (tenant) params.set("tenant", tenant);
    if (r !== "todos") params.set("rango", r);
    const qs = params.toString();
    return qs ? `/eventos?${qs}` : "/eventos";
  };

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-sm text-cumbia-yellow">Todos los shows</p>
        <h1 className="mb-6 text-3xl font-black text-cumbia-cream">Eventos</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {["todos", "hoy", "semana", "mes"].map((r) => {
            const active = (rango || "todos") === r;
            return (
              <Link
                key={r}
                href={chipHref(r)}
                className={`chip transition ${
                  active ? "border-cumbia-pink bg-cumbia-pink/20 text-cumbia-pink" : "hover:border-white/30"
                }`}
              >
                {r === "todos" ? "Todos" : RANGE_LABELS[r]}
              </Link>
            );
          })}
        </div>

        <form className="card mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          {rango && <input type="hidden" name="rango" value={rango} />}
          <div className="flex-1">
            <label className="mb-1 block text-xs text-cumbia-cream/50">Fecha</label>
            <input
              type="date"
              name="fecha"
              defaultValue={fecha}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cumbia-cream outline-none focus:border-cumbia-pink"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-cumbia-cream/50">Boliche</label>
            <select
              name="tenant"
              defaultValue={tenant || ""}
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
          <button type="submit" className="btn-primary gap-1.5">
            <IconSearch size={16} /> Buscar
          </button>
        </form>

        {upcoming.length === 0 ? (
          <p className="card p-6 text-cumbia-cream/60">No hay eventos que coincidan con la búsqueda.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map(({ show, tenant: t }) => (
              <EventCard key={show.id} show={show} tenant={t} big />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
