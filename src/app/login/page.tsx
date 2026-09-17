import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/");

  const { redirectTo } = await searchParams;

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-md px-6 py-14">
        <h1 className="mb-1 text-2xl font-black text-cumbia-cream">Ingresar</h1>
        <p className="mb-8 text-sm text-cumbia-cream/60">
          Entrá con tu cuenta para reservar, o para administrar tu boliche.
        </p>
        <LoginForm redirectTo={redirectTo} />
      </main>
    </>
  );
}
