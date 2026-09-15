/**
 * Ilustración decorativa "grabador + cassette", estilo línea neón (rosa/cian),
 * inspirada en la estética 90's/2000's de la marca. Se usa como acento en el
 * hero de home, superpuesta a la escena de disco — arte propio en SVG, no una
 * foto (no tenemos fotografía real del merchandising).
 */
export function CumbiaGear({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 150"
      className={className}
      aria-hidden="true"
    >
      {/* grabador */}
      <g transform="translate(30 18)">
        <rect x="0" y="26" width="150" height="70" rx="14" fill="#0B0710" stroke="#22E1E1" strokeWidth="2.5" />
        <rect x="10" y="10" width="18" height="22" rx="6" fill="#0B0710" stroke="#22E1E1" strokeWidth="2.5" />
        <rect x="122" y="10" width="18" height="22" rx="6" fill="#0B0710" stroke="#22E1E1" strokeWidth="2.5" />
        <circle cx="38" cy="61" r="24" fill="#0B0710" stroke="#FF2E93" strokeWidth="2.5" />
        <circle cx="38" cy="61" r="12" fill="none" stroke="#FF2E93" strokeWidth="1.6" opacity="0.7" />
        <circle cx="112" cy="61" r="24" fill="#0B0710" stroke="#FF2E93" strokeWidth="2.5" />
        <circle cx="112" cy="61" r="12" fill="none" stroke="#FF2E93" strokeWidth="1.6" opacity="0.7" />
        <rect x="66" y="40" width="18" height="8" rx="3" fill="none" stroke="#FFD400" strokeWidth="2" />
        <circle cx="70" cy="54" r="2.4" fill="#FFD400" />
        <circle cx="80" cy="54" r="2.4" fill="#FFD400" />
      </g>
      {/* cassette, superpuesto adelante */}
      <g transform="translate(96 76)">
        <rect x="0" y="0" width="112" height="66" rx="8" fill="#12061a" stroke="#FF2E93" strokeWidth="2.5" />
        <rect x="10" y="10" width="92" height="30" rx="4" fill="none" stroke="#FFD400" strokeWidth="2" />
        <circle cx="30" cy="25" r="10" fill="none" stroke="#22E1E1" strokeWidth="2.2" />
        <circle cx="82" cy="25" r="10" fill="none" stroke="#22E1E1" strokeWidth="2.2" />
        <circle cx="30" cy="25" r="3" fill="#22E1E1" />
        <circle cx="82" cy="25" r="3" fill="#22E1E1" />
        <rect x="14" y="48" width="84" height="6" rx="3" fill="#FF2E93" opacity="0.85" />
        <rect x="14" y="57" width="50" height="4" rx="2" fill="#fff" opacity="0.6" />
      </g>
    </svg>
  );
}
