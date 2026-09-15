import Link from "next/link";
import type { Show, Tenant } from "@/lib/db";
import { DiscoScene } from "@/components/DiscoScene";

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const WEEKDAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

function contrastText(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0B0710" : "#FFFFFF";
}

export function EventCard({ show, tenant, big = false }: { show: Show; tenant: Tenant; big?: boolean }) {
  const genre = show.lineup[0]?.artist.genre || "Cumbia";
  const textColor = contrastText(tenant.accentColor);

  return (
    <div className="card flex flex-col overflow-hidden transition hover:border-white/30">
      <div
        className={`relative overflow-hidden bg-black ${big ? "h-40" : "h-32"}`}
      >
        <DiscoScene tint={tenant.accentColor} variant="card" />
        <span
          className="date-pill absolute left-3 top-3 z-10"
          style={{ backgroundColor: tenant.accentColor, color: textColor }}
        >
          <span>{WEEKDAYS[show.date.getDay()]}</span>
          <span className="text-base">{show.date.getDate()}</span>
          <span>{MONTHS[show.date.getMonth()]}</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold leading-tight text-cumbia-cream">{show.title}</h3>
        <p className="flex items-center gap-1 text-xs text-cumbia-cream/60">
          📍 {tenant.name} · {tenant.city}
        </p>
        <span className="chip w-fit">{genre}</span>
        <div className="mt-auto pt-2">
          <Link
            href={`/${tenant.slug}/reservar?show=${show.id}`}
            className="inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
            style={{ backgroundColor: tenant.accentColor, color: textColor }}
          >
            Reservar
          </Link>
        </div>
      </div>
    </div>
  );
}
