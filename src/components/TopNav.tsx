import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu";
import { NavLinks } from "@/components/NavLinks";
import { IconSearch, IconUser } from "@/components/icons";
import { getSession } from "@/lib/session";

export async function TopNav({
  tenantName,
  tenantSlug,
  showBrand = true,
}: {
  tenantName?: string;
  tenantSlug?: string;
  /** false: oculta el isologo chico (la home lo reemplaza por el isologo grande del hero). */
  showBrand?: boolean;
}) {
  const session = await getSession();

  return (
    <header
      className={`sticky top-0 z-20 border-b border-white/10 backdrop-blur-md ${
        showBrand ? "bg-cumbia-night/80" : "bg-black"
      }`}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className={`flex shrink-0 items-center gap-2 ${showBrand ? "" : "invisible"}`}>
          <Image src="/logo.png" alt="Legado Cumbiero" width={40} height={40} className="rounded-lg" />
          <span className="hidden font-black tracking-tight text-cumbia-cream sm:inline">
            Legado <span className="text-cumbia-yellow">Cumbiero</span>
          </span>
        </Link>

        <NavLinks />

        <div className="flex items-center gap-3">
          {tenantSlug && tenantName && (
            <div className="hidden items-center gap-3 border-r border-white/10 pr-3 text-sm text-cumbia-cream/70 lg:flex">
              <span className="text-white/30">/</span>
              <Link href={`/${tenantSlug}`} className="hover:text-white">
                {tenantName}
              </Link>
              <Link href={`/${tenantSlug}/admin`} className="hover:text-white">
                Panel
              </Link>
            </div>
          )}
          <Link
            href="/boliches"
            aria-label="Buscar"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white hover:border-cumbia-pink hover:text-cumbia-pink"
          >
            <IconSearch size={18} />
          </Link>
          <Link
            href={session ? "/perfil" : "/login"}
            aria-label={session ? "Perfil" : "Ingresar"}
            className="hidden h-9 w-9 place-items-center rounded-full border border-white/15 text-white hover:border-cumbia-pink hover:text-cumbia-pink md:grid"
          >
            <IconUser size={18} />
          </Link>
          {session?.role === "SUPER_ADMIN" && (
            <Link href="/master" className="hidden text-sm text-cumbia-cream/50 hover:text-white sm:inline">
              Panel maestro
            </Link>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
