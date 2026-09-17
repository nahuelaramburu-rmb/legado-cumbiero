"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type AuthFormState } from "@/lib/auth-actions";

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
      {pending ? "Ingresando..." : "Ingresar"}
    </button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="card space-y-5 p-6">
      <input type="hidden" name="redirectTo" value={redirectTo ?? "/"} />

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
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-cumbia-cream outline-none focus:border-cumbia-pink"
        />
      </div>

      {state.error && <p className="text-sm text-cumbia-pink">{state.error}</p>}

      <SubmitButton />

      <p className="text-center text-sm text-cumbia-cream/60">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="font-semibold text-cumbia-pink hover:underline">
          Registrate
        </Link>
      </p>
    </form>
  );
}
