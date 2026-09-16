# Legado Cumbiero

Primera versión (MVP) de la plataforma multi-tenant para boliches: cada local
("tenant") tiene su propio espacio dentro de la misma app, con line-up de
shows, lista de invitados, reservas de entradas y un panel maestro que ve
todos los tenants.

## ⚠️ Migración en curso: backend NestJS + PostgreSQL

Se está migrando el modelo de datos y sumando login/roles reales en un
servicio nuevo (`api/`, NestJS + PostgreSQL) — ver `api/README.md` para el
detalle completo (stack, roles/permisos, endpoints, flujo de auth). **Esta
app Next.js todavía usa `src/lib/db.ts` (SQLite) para todo** — el cutover a
la nueva API (login/registro, páginas protegidas, reemplazo de `db.ts` en
cada página) es la próxima etapa. El plan completo de la migración vive en
`C:\Users\usuario\.claude\plans\squishy-munching-newell.md`.

## Stack

- **Next.js 15** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** para estilos
- **`node:sqlite`** (módulo nativo de Node 22+) como base de datos — se eligió
  en vez de Prisma porque este entorno de desarrollo bloquea la descarga de
  los binarios del motor de Prisma; no requiere instalar nada adicional ni
  compilar módulos nativos. Es experimental en Node pero perfectamente
  utilizable para este prototipo. La base vive en `data/legado-cumbiero.db`.
- Mutaciones vía **Server Actions** de Next (sin API REST separada todavía).

## Cómo correrlo

```bash
npm install
npm run seed     # carga 3 boliches de ejemplo con shows, reservas y listas
npm run dev      # http://localhost:3000
```

## Deploy con Docker (VPS)

Pensado para correr junto a otros sitios dockerizados detrás de nginx, sin
tocar lo que ya tenés andando.

- `Dockerfile`: build multi-stage, imagen final corre `node .next/standalone/server.js`
  (Next `output: "standalone"`). Necesita Node 22+ (por `node:sqlite`) — ya
  usa `node:22-bookworm-slim`.
- `docker-compose.yml`: define el servicio con un volumen (`legado-cumbiero-data`)
  para que la base SQLite persista entre despliegues. Trae comentadas las dos
  variantes típicas de exposición:
  - **nginx-proxy + acme-companion** (contenedores `nginx-proxy` /
    `acme-companion` con `VIRTUAL_HOST`/`LETSENCRYPT_HOST`): descomentar las
    env vars y conectar el servicio a la red del proxy — no requiere tocar
    ningún archivo de config, el proxy detecta el contenedor solo.
  - **nginx propio (host o dockerizado) + certbot**: descomentar el mapeo de
    puerto (`127.0.0.1:3050:3000`) y agregar un server block que haga proxy a
    ese puerto, más `certbot` para el certificado.

```bash
docker compose build
docker compose up -d
docker compose exec legado-cumbiero npm run seed   # carga los 4 boliches de ejemplo
```

La imagen de producción incluye `tsx` + `scripts/seed.ts` + `src/lib/db.ts`
(además del build compilado) sólo para poder correr el seed dentro del
contenedor ya desplegado, sin tener que generar ni copiar el archivo `.db` a
mano. La base vive en el volumen `legado-cumbiero-data` (`/app/data` dentro
del contenedor), así que persiste entre reinicios y redeploys — el seed
sólo hace falta correrlo una vez.

## Diseño

Replica el mockup de marca que definiste para Legado Cumbiero, tanto en
desktop como en mobile:

- **Logo real** (`public/logo.png`) en el nav.
- **Tipografía "Baloo 2"** (Google Fonts) en todos los títulos, para el look
  bien bold/redondeado del mockup.
- **Escena de disco** (`src/components/DiscoScene.tsx`) dibujada en SVG puro
  — bola de espejos, haces de luz de color y siluetas de gente bailando — en
  vez de fotos reales, que no tenemos. Se usa en el hero, en el header de
  cada boliche y en miniatura en las tarjetas de evento/boliche.
- Cada boliche tiene su propio `accentColor`, que tiñe su escena de disco y
  el botón "Reservar" — así cada tenant mantiene su identidad dentro de la
  misma plataforma, como en el mockup.
- **Mobile**: barra de navegación inferior fija (Inicio/Eventos/Boliches/
  Reservas/Perfil) + menú hamburguesa en el header, botón de volver y de
  favorito (♡) en la cabecera de cada boliche, y chips de filtro rápido
  (Hoy/Esta semana/Este mes) en Eventos — replicando las 3 pantallas de
  teléfono del mockup.

Cuando haya fotos reales del lugar/eventos, `DiscoScene` se reemplaza por una
imagen real en `EventCard`, `TenantCard` y la página de un tenant.

## Estructura de rutas

- `/` — home de la plataforma: hero, buscador (fecha + boliche), próximos
  eventos de todos los boliches y grilla de boliches.
- `/eventos` — listado completo de shows, con el mismo buscador.
- `/boliches` — listado de boliches con buscador por nombre/ciudad.
- `/[tenant]` — página pública de un boliche: header con su color, amenities,
  botón "Ver mapa" (Google Maps) y sus próximos eventos.
- `/[tenant]/reservar?show=...` — formulario de reserva: selector de
  cantidad +/-, nombre y WhatsApp.
- `/[tenant]/admin` — panel del boliche: métricas, alta de shows/line-up,
  reservas y lista de invitados (alta y cambio de estado).
- `/master` — panel maestro de la plataforma: alta de nuevos boliches
  (tenants, con su color y amenities) y resumen de cada uno.
- `/reservas` y `/perfil` — stubs: quedan para cuando haya login de usuario.

## Modelo de datos (`src/lib/db.ts`)

`Tenant` (boliche) → `Artist`, `Show` → `ShowArtist` (line-up),
`GuestListEntry` (lista de invitados) y `Reservation` (entradas), todos
scoped por `tenantId`. Cada boliche es independiente de los demás: los datos
de uno nunca se mezclan con los de otro, aunque hoy comparten el mismo
archivo de base de datos (aislamiento lógico, no físico).

## Qué falta para producción (a propósito fuera del alcance de esta v1)

- **Autenticación y roles reales** — 🚧 en curso, ver `api/README.md`. El
  backend (NestJS + Postgres, 4 roles: SUPER_ADMIN/TENANT_ADMIN/
  TENANT_STAFF/CUSTOMER, con permisos granulares por categoría para el
  staff) ya está escrito; falta el cutover del lado Next.js (`/login`,
  `/registro`, proteger `/master` y `/[tenant]/admin`) y el despliegue.
- **Pagos** — la reserva no cobra de verdad; falta integrar un medio de pago
  (Mercado Pago es una opción natural dado que ya lo estuviste evaluando).
- **Multi-tenant a nivel infraestructura** — 🚧 en curso junto con lo
  anterior: el nuevo backend (`api/`) ya modela todo en Postgres
  (`tenantId` por fila); falta migrar los datos de producción desde SQLite
  (script listo en `api/scripts/migrate-sqlite-to-postgres.ts`) y cortar el
  Next.js actual sobre la nueva API.
- **App multiplataforma** — esta v1 es web responsive. El mismo backend
  (Server Actions → se pueden exponer como API REST) sirve de base para una
  app nativa/Capacitor más adelante.
- **Notificaciones** — confirmación de reserva por email/WhatsApp.

## Datos de ejemplo cargados por el seed

- **El Túnel** (La Plata, rosa) — 3 shows, con reservas y lista de invitados.
- **K'mina Club** (La Plata, amarillo) — 1 show.
- **El Galpón** (Berisso, cian) — 1 show.
- **Bunker** (Ensenada, violeta) — 1 show.

Podés editar `scripts/seed.ts` para cambiar estos datos, o simplemente usar
el panel maestro (`/master`) para cargar boliches reales.
