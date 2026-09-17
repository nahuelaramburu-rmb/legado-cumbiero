"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerAction, type AuthFormState } from "@/lib/auth-actions";

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Creando cuenta..." : "Crear cuenta"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, initialState);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <div>
        <label className="mb-1 block text-sm text-cumbia-cream/70">Nombre y apellido</label>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Tu nombre"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
        />
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
