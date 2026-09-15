"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileMenu } from "@/components/MobileMenu";
import { NavLinks } from "@/components/NavLinks";
import { IconSearch, IconUser } from "@/components/icons";

export function TopNav({
  tenantName,
  tenantSlug,
  variant = "default",
}: {
  tenantName?: string;
  tenantSlug?: string;
  /** "hero": flota transparente sobre la foto del hero (solo home), como en el boceto de marca. */
  variant?: "default" | "hero";
}) {
  const isHero = variant === "hero";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHero) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHero]);

  const solid = !isHero || scrolled;

  return (
    <header
      className={`inset-x-0 top-0 transition-colors duration-300 ${
        isHero ? "fixed z-30" : "sticky z-20"
      } ${
        solid
          ? "border-b border-white/10 bg-cumbia-night/90 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-black/70 via-black/25 to-transparent"
      }`}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="relative flex shrink-0 items-center gap-2">
          <span className={`flex items-center gap-2 transition-opacity duration-300 ${solid ? "opacity-100" : "opacity-0"}`}>
            <Image src="/logo.png" alt="Legado Cumbiero" width={40} height={40} className="rounded-lg" />
            <span className="hidden font-black tracking-tight text-cumbia-cream sm:inline">
              Legado <span className="text-cumbia-yellow">Cumbiero</span>
            </span>
          </span>

          {isHero && (
            <span
              className={`pointer-events-none absolute left-0 top-full w-20 transition-opacity duration-300 sm:w-32 lg:w-44 xl:w-52 ${
                solid ? "opacity-0" : "opacity-100"
              }`}
            >
              <Image
                src="/logo-badge.png"
                alt="Legado Cumbiero"
                width={1254}
                height={1254}
                priority
                className="h-auto w-full drop-shadow-[0_10px_26px_rgba(0,0,0,0.65)]"
              />
            </span>
          )}
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
            href="/perfil"
            aria-label="Perfil"
            className="hidden h-9 w-9 place-items-center rounded-full border border-white/15 text-white hover:border-cumbia-pink hover:text-cumbia-pink md:grid"
          >
            <IconUser size={18} />
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
