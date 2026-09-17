import { notFound } from "next/navigation";
import { apiGet, apiGetOrNull } from "@/lib/api-client";
import type { GuestEntry, Reservation, ShowWithAvailability, Tenant } from "@/lib/api-types";
import { TopNav } from "@/components/TopNav";
import { addGuestAction, createShowAction, updateGuestStatusAction } from "@/lib/actions";
import { getAccessToken, requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function TenantAdminPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const session = await requireRole(["SUPER_ADMIN", "TENANT_ADMIN", "TENANT_STAFF"], { tenantSlug });

  const canManageShows = session.role !== "TENANT_STAFF" || session.permissions.includes("SHOWS_MANAGE");
  const canManageReservations = session.role !== "TENANT_STAFF" || session.permissions.includes("RESERVATIONS_MANAGE");
  const canManageGuests = session.role !== "TENANT_STAFF" || session.permissions.includes("GUEST_LIST_MANAGE");

  const tenantData = await apiGetOrNull<Tenant>(`/tenants/${tenantSlug}`);
  if (!tenantData) notFound();

  const accessToken = await getAccessToken();
  const [shows, reservations, guestEntries] = await Promise.all([
    apiGet<ShowWithAvailability[]>(`/tenants/${tenantSlug}/shows`),
    canManageReservations
      ? apiGet<Reservation[]>(`/tenants/${tenantSlug}/reservations`, accessToken ?? undefined)
      : Promise.resolve([] as Reservation[]),
    canManageGuests
      ? apiGet<GuestEntry[]>(`/tenants/${tenantSlug}/guests`, accessToken ?? undefined)
      : Promise.resolve([] as GuestEntry[]),
  ]);

  const tenant = tenantData;
  const reservationsByShow = new Map<string, Reservation[]>();
  for (const r of reservations) {
    if (!reservationsByShow.has(r.showId)) reservationsByShow.set(r.showId, []);
    reservationsByShow.get(r.showId)!.push(r);
  }
  const guestsByShow = new Map<string, GuestEntry[]>();
  for (const g of guestEntries) {
    if (!guestsByShow.has(g.showId)) guestsByShow.set(g.showId, []);
    guestsByShow.get(g.showId)!.push(g);
  }

  const totalReservas = reservations.reduce((acc, r) => acc + r.quantity, 0);
  const totalInvitados = guestEntries.reduce((acc, g) => acc + 1 + g.plusOnes, 0);

  return (
    <>
      <TopNav tenantName={tenant.name} tenantSlug={tenant.slug} />
      <main className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-cumbia-gold">Panel del boliche</p>
            <h1 className="text-3xl font-black text-cumbia-cream">{tenant.name}</h1>
          </div>
          <span className="badge bg-white/10 text-cumbia-cream/70">
            Tenant independiente · {tenant.slug}
          </span>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs uppercase text-cumbia-cream/50">Entradas vendidas</p>
            <p className="text-3xl font-black text-cumbia-cream">
              {canManageReservations ? totalReservas : "—"}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs uppercase text-cumbia-cream/50">En listas de invitados</p>
            <p className="text-3xl font-black text-cumbia-cream">{canManageGuests ? totalInvitados : "—"}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs uppercase text-cumbia-cream/50">Shows cargados</p>
            <p className="text-3xl font-black text-cumbia-cream">{shows.length}</p>
          </div>
        </div>

        {canManageShows && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-cumbia-cream/90">
              Cargar nuevo show / line-up
            </h2>
            <form action={createShowAction} className="card grid gap-3 p-6 sm:grid-cols-2">
              <input type="hidden" name="tenantSlug" value={tenant.slug} />
              <input
                name="title"
                placeholder="Título del show"
                required
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta"
              />
              <input
                type="datetime-local"
                name="date"
                required
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta"
              />
              <input
                name="artists"
                placeholder="Artistas separados por coma"
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta sm:col-span-2"
              />
              <input
                type="number"
                name="capacity"
                placeholder="Capacidad"
                defaultValue={200}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta"
              />
              <input
                type="number"
                name="ticketPrice"
                placeholder="Precio entrada"
                defaultValue={0}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-magenta"
              />
              <button type="submit" className="btn-primary sm:col-span-2">
                Publicar show
              </button>
            </form>
          </section>
        )}

        {shows.map((show) => {
          const showReservations = reservationsByShow.get(show.id) ?? [];
          const showGuests = guestsByShow.get(show.id) ?? [];
          return (
            <section key={show.id} className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-cumbia-cream">
                  {show.title} ·{" "}
                  <span className="text-cumbia-cream/50">
                    {new Intl.DateTimeFormat("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                    }).format(new Date(show.date))}
                  </span>
                </h3>
                <span className="text-xs text-cumbia-cream/50">
                  Line-up: {show.lineup.map((l) => l.artist.name).join(", ") || "—"}
                </span>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {canManageReservations && (
                  <div className="card p-5">
                    <h4 className="mb-3 text-sm font-semibold text-cumbia-cream/80">
                      Reservas / entradas ({showReservations.length})
                    </h4>
                    <div className="space-y-2">
                      {showReservations.length === 0 && (
                        <p className="text-sm text-cumbia-cream/40">Sin reservas todavía</p>
                      )}
                      {showReservations.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm"
                        >
                          <span>
                            {r.customerName} <span className="text-cumbia-cream/40">({r.customerPhone})</span>
                          </span>
                          <span className="badge bg-cumbia-magenta/20 text-cumbia-magenta">
                            x{r.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canManageGuests && (
                  <div className="card p-5">
                    <h4 className="mb-3 text-sm font-semibold text-cumbia-cream/80">
                      Lista de invitados ({showGuests.length})
                    </h4>
                    <form action={addGuestAction} className="mb-4 flex gap-2">
                      <input type="hidden" name="tenantSlug" value={tenant.slug} />
                      <input type="hidden" name="showId" value={show.id} />
                      <input
                        name="name"
                        placeholder="Nombre invitado"
                        required
                        className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cumbia-cream outline-none focus:border-cumbia-magenta"
                      />
                      <input
                        type="number"
                        name="plusOnes"
                        placeholder="+"
                        defaultValue={0}
                        className="w-16 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-cumbia-cream outline-none focus:border-cumbia-magenta"
                      />
                      <button type="submit" className="btn-secondary">
                        Agregar
                      </button>
                    </form>
                    <div className="space-y-2">
                      {showGuests.length === 0 && <p className="text-sm text-cumbia-cream/40">Lista vacía</p>}
                      {showGuests.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm"
                        >
                          <span>
                            {g.name} {g.plusOnes > 0 && `+${g.plusOnes}`}
                          </span>
                          <form action={updateGuestStatusAction} className="flex items-center gap-2">
                            <input type="hidden" name="tenantSlug" value={tenant.slug} />
                            <input type="hidden" name="guestId" value={g.id} />
                            <select
                              name="status"
                              defaultValue={g.status}
                              className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-cumbia-cream"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="confirmado">Confirmado</option>
                              <option value="ingreso">Ingresó</option>
                            </select>
                            <button
                              type="submit"
                              className="rounded-md border border-white/10 px-2 py-1 text-xs text-cumbia-cream/70 hover:bg-white/10"
                            >
                              Guardar
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
