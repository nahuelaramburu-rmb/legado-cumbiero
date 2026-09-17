import Link from "next/link";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { IconTicket } from "@/components/icons";
import { apiGet } from "@/lib/api-client";
import { getAccessToken, getSession } from "@/lib/session";
import type { Reservation } from "@/lib/api-types";

export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirectTo=/reservas");

  const accessToken = await getAccessToken();
  const reservations = await apiGet<Reservation[]>("/reservations/me", accessToken ?? undefined);

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="mb-8 text-2xl font-black text-cumbia-cream">Mis reservas</h1>

        {reservations.length === 0 ? (
          <div className="card p-8 text-center">
            <IconTicket size={32} className="mx-auto mb-3 text-cumbia-pink" />
            <p className="text-cumbia-cream/60">Todavía no hiciste ninguna reserva.</p>
            <Link href="/eventos" className="btn-primary mt-5 inline-flex">
              Ver próximos eventos
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <div key={r.id} className="card flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold text-cumbia-cream">{r.show?.title}</p>
                  <p className="text-sm text-cumbia-cream/60">
                    {r.tenant?.name}
                    {r.show?.date && (
                      <>
                        {" · "}
                        {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
                          new Date(r.show.date),
                        )}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-cumbia-magenta/20 text-cumbia-magenta">x{r.quantity}</span>
                  <span
                    className={`chip ${
                      r.status === "confirmada" ? "border-cumbia-cyan/60 text-cumbia-cyan" : "border-white/20 text-cumbia-cream/50"
                    }`}
                  >
                    {r.status === "confirmada" ? "Confirmada" : "Cancelada"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
