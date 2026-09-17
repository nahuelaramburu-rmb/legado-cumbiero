import Link from "next/link";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { IconHeart, IconTicket, IconUser } from "@/components/icons";
import { apiGet } from "@/lib/api-client";
import { logoutAction } from "@/lib/auth-actions";
import { getAccessToken, getSession } from "@/lib/session";
import type { PublicUser, Reservation, Tenant } from "@/lib/api-types";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Admin de la plataforma",
  TENANT_ADMIN: "Admin de boliche",
  TENANT_STAFF: "Staff de boliche",
  CUSTOMER: "Cliente",
};

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const accessToken = await getAccessToken();
  const me = await apiGet<PublicUser>("/auth/me", accessToken ?? undefined);
  const isCustomer = me.role === "CUSTOMER";

  const [reservations, favorites] = isCustomer
    ? await Promise.all([
        apiGet<Reservation[]>("/reservations/me", accessToken ?? undefined),
        apiGet<Tenant[]>("/favorites/me", accessToken ?? undefined),
      ])
    : [[] as Reservation[], [] as Tenant[]];

  const now = Date.now();
  const upcoming = reservations
    .filter((r) => r.status === "confirmada" && r.show?.date && new Date(r.show.date).getTime() >= now)
    .sort((a, b) => new Date(a.show!.date).getTime() - new Date(b.show!.date).getTime());

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <IconUser size={40} className="mx-auto text-cumbia-pink" />
          <h1 className="mt-4 text-2xl font-black text-cumbia-cream">
            {me.firstName} {me.lastName}
          </h1>
          <p className="mt-1 text-cumbia-cream/60">{me.email}</p>
          <span className="chip mt-3 inline-block">{ROLE_LABELS[me.role] ?? me.role}</span>
        </div>

        {isCustomer && upcoming.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cumbia-cream/60">
              <IconTicket size={15} /> Tus próximos eventos
            </h2>
            <div className="space-y-2">
              {upcoming.map((r) => (
                <div key={r.id} className="card flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-cumbia-cream">{r.show?.title}</p>
                    <p className="text-sm text-cumbia-cream/60">
                      {r.tenant?.name}
                      {r.show?.date && (
                        <>
                          {" · "}
                          {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" }).format(
                            new Date(r.show.date),
                          )}
                        </>
                      )}
                    </p>
                  </div>
                  <span className="badge bg-cumbia-magenta/20 text-cumbia-magenta">x{r.quantity}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {isCustomer && favorites.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cumbia-cream/60">
              <IconHeart size={15} /> Tus favoritos
            </h2>
            <div className="flex flex-wrap gap-2">
              {favorites.map((t) => (
                <Link key={t.id} href={`/${t.slug}`} className="chip hover:border-cumbia-pink/60">
                  {t.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-col gap-3">
          {me.role === "SUPER_ADMIN" && (
            <Link href="/master" className="card p-4 text-center font-semibold text-cumbia-cream hover:border-cumbia-pink/60">
              Panel maestro de la plataforma
            </Link>
          )}
          {(me.role === "TENANT_ADMIN" || me.role === "TENANT_STAFF") && me.tenantSlug && (
            <Link
              href={`/${me.tenantSlug}/admin`}
              className="card p-4 text-center font-semibold text-cumbia-cream hover:border-cumbia-pink/60"
            >
              Panel de mi boliche
            </Link>
          )}
          <Link href="/reservas" className="card p-4 text-center font-semibold text-cumbia-cream hover:border-cumbia-pink/60">
            Mis reservas
          </Link>

          <form action={logoutAction}>
            <button type="submit" className="w-full rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-cumbia-cream/70 hover:border-cumbia-pink hover:text-cumbia-pink">
              Cerrar sesión
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
