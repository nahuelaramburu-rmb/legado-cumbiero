"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/boliches", label: "Boliches" },
  { href: "/reservas", label: "Reservas" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-7 text-sm font-semibold text-cumbia-cream/80 md:flex">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative pb-1 transition hover:text-cumbia-pink ${
              active ? "text-cumbia-pink" : ""
            }`}
          >
            {l.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-cumbia-pink" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
