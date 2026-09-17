"use client";

import { useState, useTransition } from "react";
import { IconHeart } from "@/components/icons";
import { toggleFavoriteAction } from "@/lib/actions";

export function FavoriteButton({ tenantSlug, initialFavorite }: { tenantSlug: string; initialFavorite: boolean }) {
  const [fav, setFav] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const next = !fav;
        setFav(next);
        startTransition(async () => {
          try {
            await toggleFavoriteAction(tenantSlug, next);
          } catch {
            setFav(!next);
          }
        });
      }}
      aria-label="Favorito"
      aria-pressed={fav}
      className={`grid h-10 w-10 place-items-center rounded-full bg-black/40 backdrop-blur-sm transition hover:bg-black/60 disabled:opacity-60 ${
        fav ? "text-cumbia-pink" : "text-white"
      }`}
    >
      <IconHeart size={19} filled={fav} />
    </button>
  );
}
