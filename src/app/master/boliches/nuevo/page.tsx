import Link from "next/link";
import { apiGet } from "@/lib/api-client";
import type { LocationsResponse } from "@/lib/api-types";
import { LocationSelect } from "@/components/LocationSelect";
import { createTenantWithLocationAction } from "@/lib/master-actions";
import { IconArrowLeft, IconPlus, IconSparkle } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NuevoBolichePage() {
  const { provinces } = await apiGet<LocationsResponse>("/locations");

  return (
    <section>
      <Link
        href="/master/boliches"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-cumbia-cream/60 hover:text-cumbia-cream"
      >
        <IconArrowLeft size={14} /> Volver a boliches
      </Link>

      <div className="mb-4 flex items-center gap-2">
        <IconSparkle size={16} className="text-cumbia-yellow" />
        <h2 className="text-lg font-semibold text-cumbia-cream/90">Dar de alta un nuevo boliche</h2>
      </div>

      <form action={createTenantWithLocationAction} className="card max-w-2xl space-y-6 p-6 sm:p-8">
        <div>
          <label className="mb-1.5 block text-sm text-cumbia-cream/70">Nombre del boliche</label>
          <input
            name="name"
            required
            placeholder="Ej: El Túnel"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
          />
        </div>

        <LocationSelect provinces={provinces} />

        <div>
          <label className="mb-1.5 block text-sm text-cumbia-cream/70">Descripción</label>
          <textarea
            name="description"
            rows={2}
            placeholder="Una frase que resuma la onda del lugar"
            className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-cumbia-cream/70">Amenities</label>
          <input
            name="amenities"
            placeholder="Bailable, Bar, Estacionamiento"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
          />
          <p className="mt-1.5 text-xs text-cumbia-cream/40">Separados por coma — aparecen como chips en la página del boliche.</p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <input type="color" name="accentColor" defaultValue="#E9376F" className="h-12 w-12 shrink-0" />
          <div>
            <p className="text-sm font-medium text-cumbia-cream">Color de marca</p>
            <p className="text-xs text-cumbia-cream/40">Tiñe los botones y acentos de la página pública del boliche.</p>
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 pt-6">
          <button type="submit" className="btn-primary gap-2 px-8">
            <IconPlus size={16} /> Crear boliche
          </button>
        </div>
      </form>
    </section>
  );
}
