"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiPost, ApiError } from "./api-client";
import type { AuthResponse } from "./api-types";
import { ACCESS_COOKIE, ACCESS_MAX_AGE, REFRESH_COOKIE, REFRESH_MAX_AGE } from "./session";

async function setSessionCookies(auth: AuthResponse) {
  const store = await cookies();
  const common = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
  store.set(ACCESS_COOKIE, auth.accessToken, { ...common, maxAge: ACCESS_MAX_AGE });
  store.set(REFRESH_COOKIE, auth.refreshToken, { ...common, maxAge: REFRESH_MAX_AGE });
}

async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export interface AuthFormState {
  error?: string;
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/");

  if (!email || !password) return { error: "Completá email y contraseña" };

  let auth: AuthResponse;
  try {
    auth = await apiPost<AuthResponse>("/auth/login", { email, password });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return { error: "Email o contraseña incorrectos" };
    return { error: "No se pudo iniciar sesión, probá de nuevo" };
  }

  await setSessionCookies(auth);
  redirect(redirectTo || "/");
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const phoneAreaCode = String(formData.get("phoneAreaCode") || "").trim();
  const phoneNumber = String(formData.get("phoneNumber") || "").trim();
  const birthDate = String(formData.get("birthDate") || "").trim();
  const provinceId = String(formData.get("provinceId") || "").trim();
  const cityId = String(formData.get("cityId") || "").trim();
  const marketingOptIn = formData.get("marketingOptIn") === "on";

  if (!firstName || !lastName || !email || !password || !phoneAreaCode || !phoneNumber) {
    return { error: "Completá nombre, apellido, email, teléfono y contraseña" };
  }
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres" };

  let auth: AuthResponse;
  try {
    auth = await apiPost<AuthResponse>("/auth/register", {
      firstName,
      lastName,
      email,
      password,
      phoneAreaCode,
      phoneNumber,
      birthDate: birthDate || undefined,
      provinceId: provinceId || undefined,
      cityId: cityId || undefined,
      marketingOptIn,
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) return { error: "Ya existe una cuenta con ese email" };
    if (err instanceof ApiError && err.status === 400) return { error: "Revisá los datos ingresados" };
    return { error: "No se pudo crear la cuenta, probá de nuevo" };
  }

  await setSessionCookies(auth);
  redirect("/");
}

export async function logoutAction() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await apiPost("/auth/logout", { refreshToken }).catch(() => {});
  }
  await clearSessionCookies();
  redirect("/");
}
