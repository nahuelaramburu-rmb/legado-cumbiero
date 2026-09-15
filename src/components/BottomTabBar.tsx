"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconTicket, IconDisco, IconList, IconUser } from "@/components/icons";

const TABS = [
  { href: "/", label: "Inicio", Icon: IconHome },
  { href: "/eventos", label: "Eventos", Icon: IconTicket },
  { href: "/boliches", label: "Boliches", Icon: IconDisco },
  { href: "/reservas", label: "Reservas", Icon: IconList },
  { href: "/perfil", label: "Perfil", Icon: IconUser },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-cumbia-night/95 backdrop-blur-md md:hidden">
      {TABS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
              active ? "text-cumbia-pink" : "text-white/60"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
