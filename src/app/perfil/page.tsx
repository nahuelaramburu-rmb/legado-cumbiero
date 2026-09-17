import Link from "next/link";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { IconUser } from "@/components/icons";
import { apiGet } from "@/lib/api-client";
import { logoutAction } from "@/lib/auth-actions";
import { getAccessToken, getSession } from "@/lib/session";
import type { PublicUser } from "@/lib/api-types";

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

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <IconUser size={40} className="mx-auto text-cumbia-pink" />
          <h1 className="mt-4 text-2xl font-black text-cumbia-cream">{me.name}</h1>
          <p className="mt-1 text-cumbia-cream/60">{me.email}</p>
          <span className="chip mt-3 inline-block">{ROLE_LABELS[me.role] ?? me.role}</span>
        </div>

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
