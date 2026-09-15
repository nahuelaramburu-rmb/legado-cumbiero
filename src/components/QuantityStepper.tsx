"use client";

import { useState } from "react";

export function QuantityStepper({ max = 10 }: { max?: number }) {
  const [value, setValue] = useState(1);

  return (
    <div>
      <label className="mb-1 block text-sm text-cumbia-cream/70">Seleccioná la cantidad de entradas</label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setValue((v) => Math.max(1, v - 1))}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-lg font-bold text-cumbia-cream hover:border-cumbia-pink hover:text-cumbia-pink"
          aria-label="Restar"
        >
          −
        </button>
        <span className="w-6 text-center text-lg font-bold text-cumbia-cream">{value}</span>
        <button
          type="button"
          onClick={() => setValue((v) => Math.min(max, v + 1))}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-lg font-bold text-cumbia-cream hover:border-cumbia-pink hover:text-cumbia-pink"
          aria-label="Sumar"
        >
          +
        </button>
        <span className="text-xs text-cumbia-cream/40">Máx. {max} por reserva</span>
      </div>
      <input type="hidden" name="quantity" value={value} />
    </div>
  );
}
