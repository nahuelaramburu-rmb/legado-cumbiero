import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import type { TenantWithCounts } from "@/lib/api-types";
import { getAccessToken } from "@/lib/session";
import { IconPlus } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function BolichesPage() {
  const accessToken = await getAccessToken();
  const tenants = await apiGet<TenantWithCounts[]>("/tenants/with-counts", accessToken ?? undefined);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cumbia-cream/90">
          Todos los boliches ({tenants.length})
        </h2>
        <Link href="/master/boliches/nuevo" className="btn-primary gap-2">
          <IconPlus size={16} /> Nuevo boliche
        </Link>
      </div>

      <div className="space-y-3">
        {tenants.length === 0 && (
          <p className="card p-6 text-cumbia-cream/60">Todavía no hay boliches cargados.</p>
        )}
        {tenants.map((t) => (
          <div key={t.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="flex items-center gap-2 font-semibold text-cumbia-cream">
                {t.name}
                <span className="text-sm font-normal text-cumbia-cream/50">({t.slug})</span>
                {!t.isActive && (
                  <span className="badge bg-red-500/20 text-xs text-red-300">Desactivado</span>
                )}
              </p>
              <p className="text-sm text-cumbia-cream/60">{t.city}</p>
              <p className="mt-1 text-xs text-cumbia-cream/40">
                {t.counts.shows} shows · {t.counts.reservations} reservas · {t.counts.guestEntries} en listas
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/${t.slug}`} className="btn-secondary">
                Ver público
              </Link>
              <Link href={`/${t.slug}/admin`} className="btn-secondary">
                Panel
              </Link>
              <Link href={`/master/boliches/${t.slug}`} className="btn-primary">
                Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
