"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerAction, type AuthFormState } from "@/lib/auth-actions";
import { LocationSelect } from "@/components/LocationSelect";
import type { Province } from "@/lib/api-types";

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </button>
  );
}

export function RegisterForm({ provinces }: { provinces: Province[] }) {
  const [state, formAction] = useFormState(registerAction, initialState);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-cumbia-cream/70">Nombre</label>
          <input
            name="firstName"
            required
            autoComplete="given-name"
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-cumbia-cream/70">Apellido</label>
          <input
            name="lastName"
            required
            autoComplete="family-name"
            placeholder="Tu apellido"
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-cumbia-cream/70">Email</label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-cumbia-cream/70">Teléfono (WhatsApp)</label>
        <div className="flex gap-2">
          <div className="w-20 shrink-0">
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-cumbia-cream/40">+54</span>
              <input
                name="phoneAreaCode"
                required
                autoComplete="tel-area-code"
                inputMode="numeric"
                placeholder="221"
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
              />
            </div>
          </div>
          <input
            name="phoneNumber"
            required
            autoComplete="tel-national"
            inputMode="numeric"
            placeholder="1234567"
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
          />
        </div>
        <p className="mt-1 text-xs text-cumbia-cream/40">Código de área sin 0, número sin 15.</p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-cumbia-cream/70">Contraseña</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-cumbia-cream/70">
          Fecha de nacimiento <span className="text-cumbia-cream/40">(opcional)</span>
        </label>
        <input
          type="date"
          name="birthDate"
          autoComplete="bday"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink [color-scheme:dark]"
        />
      </div>

      <div>
        <p className="mb-1 text-sm text-cumbia-cream/70">
          Dónde vivís <span className="text-cumbia-cream/40">(opcional)</span>
        </p>
        <LocationSelect provinces={provinces} required={false} />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-cumbia-cream/70">
        <input type="checkbox" name="marketingOptIn" className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/30" />
        Quiero recibir novedades y promos de los boliches
      </label>

      {state.error && <p className="text-sm text-cumbia-pink">{state.error}</p>}

      <SubmitButton />

      <p className="text-center text-sm text-cumbia-cream/60">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-semibold text-cumbia-pink hover:underline">
          Ingresá
        </Link>
      </p>
    </form>
  );
}
