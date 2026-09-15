"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/eventos", label: "Eventos" },
  { href: "/boliches", label: "Boliches" },
  { href: "/reservas", label: "Reservas" },
  { href: "/perfil", label: "Perfil" },
  { href: "/master", label: "Panel maestro" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú"
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-cumbia-cream/80"
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-20 border-b border-white/10 bg-cumbia-night/95 px-6 py-3 backdrop-blur-md">
          <nav className="flex flex-col divide-y divide-white/5">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-semibold text-cumbia-cream/80 hover:text-cumbia-pink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
