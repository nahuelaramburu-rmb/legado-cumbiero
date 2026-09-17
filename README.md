# Legado Cumbiero

Plataforma multi-tenant para boliches: cada local ("tenant") tiene su propio
espacio dentro de la misma app, con line-up de shows, lista de invitados,
reservas de entradas, un panel maestro que ve todos los tenants, y login con
roles/permisos reales.

## Arquitectura

Dos servicios:

- **`/` (esta carpeta)** — frontend Next.js 15 (App Router). Renderiza todo
  server-side y le habla a la API por la red interna de Docker (nunca desde
  el navegador). Ya no usa `src/lib/db.ts`/SQLite para nada — se deja el
  archivo sin borrar como fallback de rollback (ver `api/README.md`
  "Rollback / safety").
- **`api/`** — backend NestJS + PostgreSQL, dueño de todos los datos
  (boliches, shows, reservas, listas de invitados) y de usuarios/roles/
  permisos. Detalle completo (stack, endpoints, flujo de auth, roles) en
  `api/README.md`.

El plan original de esta migración (contexto, decisiones técnicas, etapas)
vive en `C:\Users\usuario\.claude\plans\squishy-munching-newell.md`.

## Roles

`SUPER_ADMIN` (dueño de la plataforma) · `TENANT_ADMIN` (dueño de su boliche
y de su staff) · `TENANT_STAFF` (permisos granulares asignados por su
admin: shows, reservas, lista de invitados, config del boliche) ·
`CUSTOMER` (se autoregistra para reservar). Detalle en `api/README.md`.

## Cómo correrlo (local)

Requiere Postgres corriendo — ver `api/README.md` "Setup local" para
levantar la API primero (`cd api && npx prisma migrate dev && npm run
seed && npm run start:dev`).

```bash
npm install
cp .env.local.example .env.local   # API_INTERNAL_URL + JWT_ACCESS_SECRET (mismo secret que api/.env)
npm run dev      # http://localhost:3000
```

## Deploy con Docker (VPS)

`docker-compose.yml` define 3 servicios: `legado-cumbiero` (este frontend,
publicado en `127.0.0.1:3050`), `postgres` (sin published port, sólo red
interna) y `legado-api` (publicado en `127.0.0.1:3051` — pensado para un
nginx propio del host; ver `api/README.md` para el bloque de nginx del
subdominio público opcional). Los secrets (`POSTGRES_PASSWORD`,
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) viven en un `.env` sin versionar
junto al `docker-compose.yml` en la VPS.

```bash
docker compose up -d postgres
docker compose run --rm legado-api npx prisma migrate deploy
docker compose up -d --build   # los 3 servicios
docker compose exec -e NODE_ENV=development legado-api npm run seed   # datos de ejemplo (opcional)
```

## Diseño

Replica el mockup de marca que definiste para Legado Cumbiero, tanto en
desktop como en mobile:

- **Logo real** (`public/logo.png`, y `public/logo-badge.png` sin fondo
  para el hero) en el nav y en el hero de la home.
- **Tipografía "Baloo 2"** (Google Fonts) en todos los títulos.
- **Foto real del hero** (`public/hero-banner.png`) + **escena de disco**
  (`src/components/DiscoScene.tsx`, SVG puro) usada en el resto de la app
  (header de cada boliche, miniaturas de evento/boliche) donde no hay foto
  real todavía.
- Cada boliche tiene su propio `accentColor`, que tiñe su escena de disco y
  el botón "Reservar".
- **Mobile**: barra de navegación inferior fija (Inicio/Eventos/Boliches/
  Reservas/Perfil) + menú hamburguesa en el header.

## Estructura de rutas

- `/` — home: hero, buscador (fecha + boliche), próximos eventos y grilla
  de boliches.
- `/eventos` — listado completo de shows, con el mismo buscador.
- `/boliches` — listado de boliches con buscador por nombre/ciudad.
- `/[tenant]` — página pública de un boliche: header con su color,
  amenities, botón "Ver mapa" y sus próximos eventos (con cupo disponible).
- `/[tenant]/reservar?show=...` — formulario de reserva. Checkout de
  invitado, sin necesidad de estar logueado (paridad con el flujo original).
- `/[tenant]/admin` — panel del boliche. **Protegido**: requiere ser
  `SUPER_ADMIN`, o `TENANT_ADMIN`/`TENANT_STAFF` de ese tenant. Cada sección
  (crear show, reservas, lista de invitados) se muestra u oculta según los
  permisos del usuario logueado.
- `/master` — panel maestro de la plataforma. **Protegido**: sólo
  `SUPER_ADMIN`.
- `/login`, `/registro` — login y autoregistro (siempre crea `CUSTOMER`; el
  staff de un boliche lo crea su `TENANT_ADMIN` desde el panel — endpoint ya
  existe en la API, falta la UI).
- `/perfil` — datos de la cuenta logueada + accesos rápidos según rol +
  cerrar sesión.
- `/reservas` — placeholder honesto: como las reservas son de invitado (sin
  atarse a una cuenta), todavía no hay un historial que mostrar acá.

## Modelo de datos

Fuente de verdad: `api/prisma/schema.prisma` (Postgres). `Tenant` →
`Artist`, `Show` → `ShowArtist` (line-up), `GuestListEntry`, `Reservation`
— todos scoped por `tenantId` — más `User`/`RefreshToken`/`StaffPermission`
para auth/roles. `src/lib/db.ts` (SQLite) queda en el repo sin usarse, como
fallback de rollback hasta el burn-in en producción.

## Qué falta para producción

- **Pagos** — la reserva no cobra de verdad; falta integrar un medio de pago
  (Mercado Pago es una opción natural).
- **Migrar datos reales** — la VPS corre hoy con datos de seed, no con los
  del SQLite viejo de producción; falta correr
  `api/scripts/migrate-sqlite-to-postgres.ts` contra ese volumen.
- **Reservas atadas a cuenta** — hoy son siempre checkout de invitado
  (`customerName`/`customerPhone` sueltos, sin `userId`); si se quiere un
  historial real en `/reservas`, hay que sumar esa relación.
- **App multiplataforma** — esta v1 es web responsive. La API REST ya
  existe (`api/`) y sirve de base para una app nativa/Capacitor.
- **Notificaciones** — confirmación de reserva por email/WhatsApp.
- **Tests** — la API no tiene tests automatizados todavía (unitarios de
  guards/servicios, e2e de auth).

## Datos de ejemplo cargados por el seed (`api/prisma/seed.ts`)

4 boliches (El Túnel, K'mina Club, El Galpón, Bunker), cada uno con su
`TENANT_ADMIN`, shows, reservas y listas de invitados, más un `SUPER_ADMIN`
de plataforma y un `TENANT_STAFF` de ejemplo con permisos parciales. Todas
las cuentas de ejemplo comparten contraseña — ver la tabla completa en
`api/README.md`. El seed se niega a correr si `NODE_ENV=production` (es
sólo para desarrollo/demo).
