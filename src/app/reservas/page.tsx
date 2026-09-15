import { TopNav } from "@/components/TopNav";
import { IconTicket } from "@/components/icons";

export default function ReservasPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <IconTicket size={40} className="mx-auto text-cumbia-pink" />
        <h1 className="mt-4 text-2xl font-black text-cumbia-cream">Mis reservas</h1>
        <p className="mt-2 text-cumbia-cream/60">
          Esta sección va a mostrar tus entradas y reservas una vez que la plataforma tenga
          cuentas de usuario (login). Por ahora, cada boliche ve sus propias reservas desde
          su panel.
        </p>
      </main>
    </>
  );
}
