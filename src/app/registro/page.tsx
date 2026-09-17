import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { RegisterForm } from "@/components/RegisterForm";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function RegistroPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-md px-6 py-14">
        <h1 className="mb-1 text-2xl font-black text-cumbia-cream">Crear cuenta</h1>
        <p className="mb-8 text-sm text-cumbia-cream/60">
          Registrate para reservar entradas y guardar tus datos para la próxima.
        </p>
        <RegisterForm />
      </main>
    </>
  );
}
