import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/MobileMenu";

export function TopNav({
  tenantName,
  tenantSlug,
}: {
  tenantName?: string;
  tenantSlug?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-cumbia-night/80 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/logo.png" alt="Legado Cumbiero" width={40} height={40} className="rounded-lg" />
          <span className="hidden font-black tracking-tight text-cumbia-cream sm:inline">
            Legado <span className="text-cumbia-yellow">Cumbiero</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-cumbia-cream/80 md:flex">
          <Link href="/" className="hover:text-cumbia-pink">
            Inicio
          </Link>
          <Link href="/eventos" className="hover:text-cumbia-pink">
            Eventos
          </Link>
          <Link href="/boliches" className="hover:text-cumbia-pink">
            Boliches
          </Link>
          <Link href="/reservas" className="hover:text-cumbia-pink">
            Reservas
          </Link>
        </nav>

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
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cumbia-cream/70 hover:border-cumbia-pink hover:text-cumbia-pink"
          >
            🔍
          </Link>
          <Link
            href="/perfil"
            aria-label="Perfil"
            className="hidden h-9 w-9 place-items-center rounded-full border border-white/15 text-cumbia-cream/70 hover:border-cumbia-pink hover:text-cumbia-pink md:grid"
          >
            👤
          </Link>
          <Link href="/master" className="hidden text-sm text-cumbia-cream/50 hover:text-white sm:inline">
            Panel maestro
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
