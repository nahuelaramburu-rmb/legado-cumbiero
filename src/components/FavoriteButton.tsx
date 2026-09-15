"use client";

import { useState } from "react";

export function FavoriteButton() {
  const [fav, setFav] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFav((v) => !v)}
      aria-label="Favorito"
      aria-pressed={fav}
      className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-lg backdrop-blur-sm transition hover:bg-black/60"
    >
      {fav ? "❤️" : "🤍"}
    </button>
  );
}
