import Link from "next/link";
import type { Tenant } from "@/lib/db";
import { DiscoScene } from "@/components/DiscoScene";

export function TenantCard({ tenant, nextShowTitle }: { tenant: Tenant; nextShowTitle?: string }) {
  return (
    <Link href={`/${tenant.slug}`} className="card group flex items-center gap-4 p-4 transition hover:border-white/30">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black">
        <DiscoScene tint={tenant.accentColor} variant="card" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-bold text-cumbia-cream">{tenant.name}</h3>
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: tenant.accentColor }} />
        </div>
        <p className="text-xs text-cumbia-cream/60">📍 {tenant.city}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {tenant.amenities.slice(0, 3).map((a) => (
            <span key={a} className="chip">
              {a}
            </span>
          ))}
        </div>
        {nextShowTitle && <p className="mt-1 truncate text-xs text-cumbia-gold">Próximo: {nextShowTitle}</p>}
      </div>
      <span className="shrink-0 text-cumbia-pink opacity-0 transition group-hover:opacity-100">→</span>
    </Link>
  );
}
