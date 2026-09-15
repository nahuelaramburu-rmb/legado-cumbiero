import * as db from "@/lib/db";
import { TopNav } from "@/components/TopNav";
import { TenantCard } from "@/components/TenantCard";

export const dynamic = "force-dynamic";

export default async function BolichesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  let tenants = db.listTenantsWithNextShow();
  if (q) {
    const needle = q.toLowerCase();
    tenants = tenants.filter(
      (t) => t.name.toLowerCase().includes(needle) || t.city.toLowerCase().includes(needle)
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-6 py-14">
        <p className="text-sm text-cumbia-yellow">Plataforma</p>
        <h1 className="mb-8 text-3xl font-black text-cumbia-cream">Boliches</h1>

        <form className="mb-8">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar boliche…"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-cumbia-cream outline-none focus:border-cumbia-pink"
          />
        </form>

        {tenants.length === 0 ? (
          <p className="card p-6 text-cumbia-cream/60">No se encontraron boliches.</p>
        ) : (
          <div className="space-y-3">
            {tenants.map((t) => (
              <TenantCard key={t.id} tenant={t} nextShowTitle={t.shows[0]?.title} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
