"use client";

import { useState } from "react";
import type { Province } from "@/lib/api-types";

/**
 * Selector encadenado provincia → ciudad. Recibe todas las provincias (con
 * sus ciudades) ya cargadas como prop — no hace fetch propio, así que
 * cambiar de provincia es instantáneo y no depende de la API externa.
 */
export function LocationSelect({
  provinces,
  defaultProvinceId,
  defaultCityId,
  required = true,
}: {
  provinces: Province[];
  defaultProvinceId?: string;
  defaultCityId?: string;
  /** false: campos opcionales (ej. registro de cliente) — default true para no tocar los usos existentes. */
  required?: boolean;
}) {
  const [provinceId, setProvinceId] = useState(defaultProvinceId ?? "");
  const [cityId, setCityId] = useState(defaultCityId ?? "");
  const cities = provinces.find((p) => p.id === provinceId)?.cities ?? [];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm text-cumbia-cream/70">Provincia</label>
        <select
          name="provinceId"
          required={required}
          value={provinceId}
          onChange={(e) => {
            setProvinceId(e.target.value);
            setCityId("");
          }}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
        >
          <option value="" disabled>
            Elegí una provincia
          </option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-cumbia-cream/70">Ciudad</label>
        <select
          name="cityId"
          required={required}
          disabled={!provinceId}
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink disabled:opacity-40"
        >
          <option value="" disabled>
            {provinceId ? "Elegí una ciudad" : "Elegí primero la provincia"}
          </option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
