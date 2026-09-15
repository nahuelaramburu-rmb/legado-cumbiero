/**
 * Escena de "pista de baile" dibujada en SVG: bola de espejos, haces de luz de
 * color y siluetas de gente bailando. Reemplaza a una foto real (no tenemos
 * fotografía del boliche) manteniendo el clima del mockup de marca: disco ball,
 * luces de colores y ambiente de fiesta oscuro.
 */
export function DiscoScene({
  tint = "#FF2E93",
  variant = "card",
  className = "",
}: {
  tint?: string;
  variant?: "card" | "hero";
  className?: string;
}) {
  const id = Math.random().toString(36).slice(2, 9);
  const crowd = variant === "hero";

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint} stopOpacity="0.45" />
          <stop offset="55%" stopColor="#12061a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#05030a" stopOpacity="1" />
        </linearGradient>
        <radialGradient id={`ball-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#cfd8e6" />
          <stop offset="100%" stopColor="#7d8aa0" />
        </radialGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.55" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="260" fill={`url(#bg-${id})`} />

      {/* haces de luz */}
      <g opacity="0.55">
        <polygon points="60,0 -40,260 140,260" fill={tint} opacity="0.25" />
        <polygon points="150,0 40,260 260,260" fill="#22E1E1" opacity="0.16" />
        <polygon points="260,0 160,260 400,260" fill="#FFD400" opacity="0.14" />
      </g>

      <circle cx="60" cy="55" r="70" fill={`url(#glow-${id})`} />

      {/* siluetas de gente (solo hero) */}
      {crowd && (
        <g fill="#05030a">
          <ellipse cx="30" cy="248" rx="30" ry="26" />
          <ellipse cx="80" cy="252" rx="34" ry="30" />
          <ellipse cx="140" cy="246" rx="28" ry="24" />
          <ellipse cx="195" cy="253" rx="36" ry="30" />
          <ellipse cx="250" cy="247" rx="30" ry="26" />
          <ellipse cx="305" cy="252" rx="34" ry="30" />
          <ellipse cx="360" cy="246" rx="30" ry="26" />
          <rect x="0" y="235" width="400" height="25" />
        </g>
      )}

      {/* bola de espejos — grande y semi-cortada por el borde en el hero, como en el mockup */}
      <g transform={`translate(${crowd ? 372 : 300} ${crowd ? 38 : 60})`}>
        <line x1="0" y1={crowd ? -60 : -70} x2="0" y2={crowd ? -34 : -22} stroke="#3a3a3a" strokeWidth="1.5" />
        <circle r={crowd ? 34 : 22} fill={`url(#ball-${id})`} />
        <g stroke="#8b96a8" strokeWidth="0.6" opacity="0.6">
          <circle r={crowd ? 34 : 22} fill="none" />
          <ellipse rx={crowd ? 34 : 22} ry={crowd ? 10 : 7} fill="none" />
          <ellipse rx={crowd ? 34 : 22} ry={crowd ? 21 : 14} fill="none" />
          <ellipse rx={crowd ? 10 : 7} ry={crowd ? 34 : 22} fill="none" />
          <ellipse rx={crowd ? 21 : 14} ry={crowd ? 34 : 22} fill="none" />
        </g>
        <circle cx={crowd ? -12 : -8} cy={crowd ? -12 : -8} r={crowd ? 5 : 3.5} fill="#fff" opacity="0.9" />
        <circle cx={crowd ? 10 : 7} cy={crowd ? 8 : 5} r={crowd ? 3 : 2} fill="#fff" opacity="0.7" />
      </g>

      {/* destellos */}
      <g fill="#ffffff">
        <circle className="sparkle" cx="90" cy="40" r="1.6" style={{ animationDelay: "0s" }} />
        <circle className="sparkle" cx="200" cy="90" r="1.3" style={{ animationDelay: "0.6s" }} />
        <circle className="sparkle" cx="330" cy="120" r="1.8" style={{ animationDelay: "1.1s" }} />
        <circle className="sparkle" cx="150" cy="150" r="1.2" style={{ animationDelay: "1.6s" }} />
        <circle className="sparkle" cx="260" cy="40" r="1.4" style={{ animationDelay: "0.3s" }} />
      </g>
    </svg>
  );
}
