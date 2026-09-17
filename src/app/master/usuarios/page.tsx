import { apiGet } from "@/lib/api-client";
import type { PublicUser, Tenant } from "@/lib/api-types";
import { createTenantAdminAction, setUserActiveAction } from "@/lib/master-actions";
import { getAccessToken, getSession } from "@/lib/session";
import { IconPlus, IconUser } from "@/components/icons";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<PublicUser["role"], string> = {
  SUPER_ADMIN: "Admin de plataforma",
  TENANT_ADMIN: "Admin de boliche",
  TENANT_STAFF: "Staff",
  CUSTOMER: "Cliente",
};

export default async function UsuariosPage() {
  const accessToken = await getAccessToken();
  const session = await getSession();
  const [users, tenants] = await Promise.all([
    apiGet<PublicUser[]>("/admin/users", accessToken ?? undefined),
    apiGet<Tenant[]>("/tenants", accessToken ?? undefined),
  ]);

  return (
    <section className="space-y-10">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <IconPlus size={16} className="text-cumbia-yellow" />
          <h2 className="text-lg font-semibold text-cumbia-cream/90">Crear admin de boliche</h2>
        </div>
        <form action={createTenantAdminAction} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Boliche</label>
            <select
              name="tenantSlug"
              required
              defaultValue=""
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            >
              <option value="" disabled>
                Elegí un boliche
              </option>
              {tenants.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Nombre</label>
            <input
              name="firstName"
              required
              placeholder="Nombre"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Apellido</label>
            <input
              name="lastName"
              required
              placeholder="Apellido"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@boliche.com"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-cumbia-cream/70">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-cumbia-cream outline-none transition focus:border-cumbia-pink"
            />
          </div>
          <div className="flex justify-end sm:col-span-2">
            <button type="submit" className="btn-primary gap-2 px-8">
              <IconPlus size={16} /> Crear admin
            </button>
          </div>
        </form>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <IconUser size={16} className="text-cumbia-yellow" />
          <h2 className="text-lg font-semibold text-cumbia-cream/90">Todos los usuarios ({users.length})</h2>
        </div>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="flex items-center gap-2 font-medium text-cumbia-cream">
                  {u.firstName} {u.lastName}
                  {!u.isActive && <span className="badge bg-red-500/20 text-xs text-red-300">Desactivado</span>}
                </p>
                <p className="text-sm text-cumbia-cream/50">{u.email}</p>
                <p className="mt-1 text-xs text-cumbia-cream/40">
                  {ROLE_LABEL[u.role]}
                  {u.tenantSlug && ` · ${u.tenantSlug}`}
                </p>
              </div>
              {u.id !== session?.id && (
                <form action={setUserActiveAction}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input type="hidden" name="isActive" value={(!u.isActive).toString()} />
                  <button
                    type="submit"
                    className={
                      u.isActive
                        ? "rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                        : "rounded-md border border-white/10 px-3 py-1.5 text-xs text-cumbia-cream/70 hover:bg-white/10"
                    }
                  >
                    {u.isActive ? "Desactivar" : "Activar"}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
