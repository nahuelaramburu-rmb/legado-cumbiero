import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { IconDisco, IconUser } from "@/components/icons";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/master/boliches", label: "Boliches", icon: IconDisco },
  { href: "/master/usuarios", label: "Usuarios", icon: IconUser },
];

export default async function MasterLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["SUPER_ADMIN"]);

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-sm text-cumbia-gold">Plataforma</p>
        <h1 className="mb-8 text-3xl font-black text-cumbia-cream">Panel maestro</h1>

        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:self-start lg:overflow-visible lg:pb-0">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium text-cumbia-cream/70 transition hover:bg-white/5 hover:text-cumbia-cream"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="min-w-0">{children}</div>
        </div>
      </main>
    </>
  );
}
