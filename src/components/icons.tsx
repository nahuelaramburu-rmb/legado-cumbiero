/**
 * Set de íconos de línea (silueta blanca vía `currentColor`), para reemplazar
 * los emojis usados durante el prototipado. Mismo estilo en todas las vistas:
 * trazo 1.8, esquinas redondeadas, sin relleno salvo donde se indica.
 */
import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
}

export function IconSearch({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconUser({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.8 4.4-5.7 7.5-5.7s6.1 1.9 7.5 5.7" />
    </svg>
  );
}

export function IconHome({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  );
}

export function IconTicket({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.2a1.6 1.6 0 0 0 0 3.2V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.6a1.6 1.6 0 0 0 0-3.2Z" />
      <path d="M9.5 7.5v9" strokeDasharray="2.4 2.4" />
    </svg>
  );
}

export function IconDisco({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.7 12h16.6M12 3.7v16.6M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8" opacity="0.6" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconList({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.2" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.2" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4.2" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMapPin({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function IconChevronRight({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function IconArrowRight({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

export function IconArrowLeft({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M20 12H4M11 5l-7 7 7 7" />
    </svg>
  );
}

export function IconMenu({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconClose({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconHeart({ size = 20, className, filled = false, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...base(size, className)}
      fill={filled ? "currentColor" : "none"}
      {...p}
    >
      <path d="M12 20.2s-7.3-4.6-9.8-9.1C.6 7.8 2 4.3 5.3 3.4c2.1-.6 4.2.2 5.5 2 .4.5.7 1 .9 1.4.2-.4.5-.9.9-1.4 1.3-1.8 3.4-2.6 5.5-2 3.3.9 4.7 4.4 3.1 7.7-2.5 4.5-9.2 9.1-9.2 9.1Z" />
    </svg>
  );
}

export function IconCrown({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} fill="currentColor" stroke="none" {...p}>
      <path d="M3 8.5 7 11l5-6.5L17 11l4-2.5-1.4 9.4a1 1 0 0 1-1 .85H5.4a1 1 0 0 1-1-.85L3 8.5Z" />
      <rect x="5" y="19" width="14" height="1.8" rx="0.9" />
    </svg>
  );
}

export function IconCalendar({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
      <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" />
    </svg>
  );
}

export function IconPlus({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconMinus({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} {...p}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconSparkle({ size = 20, className, ...p }: IconProps) {
  return (
    <svg {...base(size, className)} fill="currentColor" stroke="none" {...p}>
      <path d="M12 2c.6 3.4 1.6 5.6 3 7 1.4 1.4 3.6 2.4 7 3-3.4.6-5.6 1.6-7 3-1.4 1.4-2.4 3.6-3 7-.6-3.4-1.6-5.6-3-7-1.4-1.4-3.6-2.4-7-3 3.4-.6 5.6-1.6 7-3 1.4-1.4 2.4-3.6 3-7Z" />
    </svg>
  );
}
