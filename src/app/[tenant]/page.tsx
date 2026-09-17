import { notFound } from "next/navigation";
import Link from "next/link";
import { apiGet, apiGetOrNull } from "@/lib/api-client";
import type { ShowWithAvailability, Tenant } from "@/lib/api-types";
import { TopNav } from "@/components/TopNav";
import { DiscoScene } from "@/components/DiscoScene";
import { FavoriteButton } from "@/components/FavoriteButton";
import { IconArrowLeft, IconHeart, IconMapPin } from "@/components/icons";
import { getAccessToken, getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenantData = await apiGetOrNull<Tenant>(`/tenants/${tenantSlug}`);
  if (!tenantData || !tenantData.isActive) notFound();
  const allShows = await apiGet<ShowWithAvailability[]>(`/tenants/${tenantSlug}/shows`);
  const shows = allShows.filter((s) => s.isActive);
  const tenant = { ...tenantData, shows };

  const session = await getSession();
  let isFavorite = false;
  if (session) {
    const accessToken = await getAccessToken();
    const res = await apiGet<{ favorited: boolean }>(`/favorites/${tenantSlug}/mine`, accessToken ?? undefined);
    isFavorite = res.favorited;
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${tenant.name} ${tenant.city}`
  )}`;

  return (
    <>
      <TopNav tenantName={tenant.name} tenantSlug={tenant.slug} />
      <main>
        <div className="relative flex h-56 items-end overflow-hidden bg-black sm:h-64">
          {tenant.coverImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tenant.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
            </>
          ) : (
            <DiscoScene tint={tenant.accentColor} variant="hero" />
          )}

          {/* back + favorito, estilo mobile del mockup */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 md:hidden">
            <Link
              href="/boliches"
              aria-label="Volver"
              className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm"
            >
              <IconArrowLeft size={18} />
            </Link>
            {session ? (
              <FavoriteButton tenantSlug={tenant.slug} initialFavorite={isFavorite} />
            ) : (
              <Link
                href={`/login?redirectTo=/${tenant.slug}`}
                aria-label="Iniciá sesión para guardar como favorito"
                className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                <IconHeart size={19} />
              </Link>
            )}
          </div>

          <span
            className="badge absolute right-6 top-6 z-10 hidden text-xs font-bold md:inline-block"
            style={{ backgroundColor: tenant.accentColor, color: "#fff" }}
          >
            Tenant: {tenant.name}
          </span>
          <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-6">
            <p className="flex items-center gap-1 text-sm text-cumbia-cream/70">
              <IconMapPin size={14} className="text-white/80" /> {tenant.city}
            </p>
            <h1 className="text-4xl font-black text-cumbia-cream drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              {tenant.name}
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-4 max-w-2xl text-cumbia-cream/70">{tenant.description}</p>
          <div className="mb-10 flex flex-wrap gap-2">
            {tenant.amenities.map((a) => (
              <span key={a} className="chip">
                {a}
              </span>
            ))}
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary ml-auto inline-flex items-center gap-1.5"
            >
              <IconMapPin size={15} /> Ver mapa
            </a>
          </div>

          <h2 className="mb-5 text-lg font-semibold text-cumbia-cream/90">Próximos eventos</h2>
          <div className="grid gap-5">
            {tenant.shows.length === 0 && (
              <p className="card p-6 text-cumbia-cream/60">
                Sin shows cargados todavía para este boliche.
              </p>
            )}
            {tenant.shows.map((show) => {
              const remaining = Math.max(show.capacity - show.reservedCount, 0);
              const genre = show.lineup[0]?.artist.genre || "Cumbia";
              return (
                <div key={show.id} className="card p-6 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-cumbia-yellow">
                        {new Intl.DateTimeFormat("es-AR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        }).format(new Date(show.date))}
                      </p>
                      <span className="chip">{genre}</span>
                    </div>
                    <h3 className="text-xl font-bold text-cumbia-cream">{show.title}</h3>
                    <p className="mt-1 text-sm text-cumbia-cream/70">
                      Line-up:{" "}
                      {show.lineup
                        .map((l) => `${l.artist.name}${l.slotTime ? ` (${l.slotTime})` : ""}`)
                        .join(" · ")}
                    </p>
                    <p className="mt-1 text-xs text-cumbia-cream/50">
                      {remaining} entradas disponibles de {show.capacity}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-3 sm:mt-0">
                    <Link
                      href={`/${tenant.slug}/reservar?show=${show.id}`}
                      className="rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                      style={{ backgroundColor: tenant.accentColor }}
                    >
                      {show.ticketPrice > 0 ? `Reservar · $${show.ticketPrice}` : "Reservar entrada"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
