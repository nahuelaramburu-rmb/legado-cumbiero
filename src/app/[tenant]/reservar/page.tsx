import { notFound, redirect } from "next/navigation";
import { apiGet, apiGetOrNull } from "@/lib/api-client";
import type { PublicUser, Show, Tenant } from "@/lib/api-types";
import { TopNav } from "@/components/TopNav";
import { QuantityStepper } from "@/components/QuantityStepper";
import { createReservationAction } from "@/lib/actions";
import { getAccessToken, getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReservarPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ show?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const { show: showId } = await searchParams;

  const session = await getSession();
  if (!session) redirect(`/login?redirectTo=/${tenantSlug}/reservar${showId ? `?show=${showId}` : ""}`);

  const tenant = await apiGetOrNull<Tenant>(`/tenants/${tenantSlug}`);
  if (!tenant) notFound();

  const show = showId ? await apiGetOrNull<Show>(`/shows/${showId}`) : null;
  if (!show) notFound();

  const accessToken = await getAccessToken();
  const me = await apiGet<PublicUser>("/auth/me", accessToken ?? undefined);

  return (
    <>
      <TopNav tenantName={tenant.name} tenantSlug={tenant.slug} />
      <main className="mx-auto max-w-lg px-6 py-14">
        <p className="text-sm font-semibold" style={{ color: tenant.accentColor }}>
          {tenant.name} · {tenant.city}
        </p>
        <h1 className="mb-1 text-2xl font-black text-cumbia-cream">{show.title}</h1>
        <p className="mb-8 text-sm text-cumbia-cream/60">
          {new Intl.DateTimeFormat("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }).format(new Date(show.date))}{" "}
          ·{" "}
          {new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(new Date(show.date))} hs ·{" "}
          {show.lineup.map((l) => l.artist.name).join(", ")}
        </p>

        <form action={createReservationAction} className="card space-y-5 p-6">
          <input type="hidden" name="tenantSlug" value={tenant.slug} />
          <input type="hidden" name="showId" value={show.id} />

          <QuantityStepper max={10} />

          <div>
            <label className="mb-1 block text-sm text-cumbia-cream/70">
              Nombre y apellido
            </label>
            <input
              name="customerName"
              required
              defaultValue={me.name}
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-cumbia-cream/70">WhatsApp</label>
            <input
              type="tel"
              name="customerPhone"
              required
              placeholder="+54 221 1234567"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
            />
          </div>
          {show.ticketPrice > 0 && (
            <p className="text-sm text-cumbia-cream/60">
              Precio unitario: ${show.ticketPrice}
            </p>
          )}
          <button type="submit" className="btn-primary w-full">
            Confirmar reserva
          </button>
        </form>
      </main>
    </>
  );
}
