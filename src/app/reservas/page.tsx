import Link from "next/link";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { IconTicket } from "@/components/icons";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirectTo=/reservas");

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <IconTicket size={40} className="mx-auto text-cumbia-pink" />
        <h1 className="mt-4 text-2xl font-black text-cumbia-cream">Mis reservas</h1>
        <p className="mt-2 text-cumbia-cream/60">
          Todavía reservás como invitado (sin que la entrada quede atada a tu cuenta) — así que por
          ahora no hay un historial acá para mostrar. Cada boliche ve todas sus reservas desde su
          panel.
        </p>
        <Link href="/eventos" className="btn-primary mt-6 inline-flex">
          Ver próximos eventos
        </Link>
      </main>
    </>
  );
}
