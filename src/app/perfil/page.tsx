import { TopNav } from "@/components/TopNav";
import { IconUser } from "@/components/icons";

export default function PerfilPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <IconUser size={40} className="mx-auto text-cumbia-pink" />
        <h1 className="mt-4 text-2xl font-black text-cumbia-cream">Perfil</h1>
        <p className="mt-2 text-cumbia-cream/60">
          El login y el perfil de usuario quedan para la próxima iteración, junto con
          autenticación y roles por boliche.
        </p>
      </main>
    </>
  );
}
