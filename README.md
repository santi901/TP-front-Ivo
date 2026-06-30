# Habit Tracker 🔥

[![CI/CD](https://github.com/santi901/TP-front-Ivo/actions/workflows/ci.yml/badge.svg)](https://github.com/santi901/TP-front-Ivo/actions/workflows/ci.yml)

Aplicación web para seguir hábitos diarios: el usuario crea sus hábitos, los marca día a
día y visualiza su progreso (rachas, calendario). Trabajo Práctico — Aplicación Serverless.

🌐 **Producción:** https://TODO-completar-url.vercel.app
<!-- Reemplazar por la URL real de Vercel cuando esté desplegado. -->

📋 La documentación de calidad (estrategia de tests, pipeline, decisiones) está en
[`CALIDAD.md`](./CALIDAD.md).

## Stack tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Frontend | [Astro](https://astro.build) | Layout y páginas con SSR/estático, rápido y simple |
| Interactividad | Islas de [React](https://react.dev) | Solo donde hace falta estado e interacción (marcar hábitos, rachas) |
| Backend (BaaS) | [Supabase](https://supabase.com) | Autenticación + base de datos Postgres en la nube, sin servidor propio |
| Deploy | [Vercel](https://vercel.com) | Despliegue continuo desde el repositorio |

> **Decisión técnica clave:** se usa Astro para el layout y React como *islas* únicamente
> en los componentes interactivos. Así se combina la simplicidad/rendimiento de Astro con
> la comodidad de React para manejar estado (rachas, contadores, calendario).

## Modelo de datos (en Supabase)

- **habits** — hábitos del usuario: `id`, `user_id`, `name`, `icon`, `color`, `frequency`, `created_at`.
- **habit_logs** — registros de cumplimiento: `id`, `habit_id`, `user_id`, `date`.

Ambas tablas con políticas RLS para que cada usuario acceda solo a sus propios datos.

## Requisitos cumplidos (consigna)

- [ ] Registro, inicio y cierre de sesión (Supabase Auth)
- [ ] Crear, visualizar y editar hábitos asociados al usuario (CRUD)
- [ ] Persistencia en base de datos en la nube (Postgres de Supabase)
- [ ] *(Opcional)* Edición de datos del usuario / perfil
- [ ] *(Opcional)* CDN para imágenes (Supabase Storage)
- [ ] *(Opcional)* Estrategia de ramas + Conventional Commits + Pull Requests

## Cómo correr el proyecto localmente

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar las credenciales de Supabase:
   ```bash
   cp .env.example .env
   ```
   Completar en `.env` los valores de `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`
   (Supabase Dashboard → Project Settings → API).
3. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La app queda en `http://localhost:4321`.

## Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `./dist/` |
| `npm run preview` | Previsualiza el build localmente |
| `npm run lint` | Linter (ESLint) + chequeo de tipos (`astro check`) |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:coverage` | Tests unitarios con reporte de cobertura |
| `npm run test:e2e` | Tests end-to-end (Playwright) |

## Estructura del proyecto

```
src/
├── components/   # Componentes reutilizables (.astro y islas React .jsx/.tsx)
├── layouts/      # Layout base de las páginas
├── lib/          # Clientes y utilidades (cliente de Supabase)
├── pages/        # Rutas de la app (file-based routing de Astro)
└── styles/       # Estilos globales
```

## Organización del equipo

| Rama | Responsable | Rol |
|------|-------------|-----|
| `Santi-Front` | Santi | Frontend (UI, islas React, integración con Supabase) |
| `Nacho-Back` | Nacho | Backend (modelado de datos, Auth y RLS en Supabase) |
| `Develop` | — | Integración de features |
| `main` | — | Versión funcional desplegada |

## Flujo de trabajo (Git + GitHub)

Ningún cambio se mergea directo a `main` ni a `Develop`: todo pasa por una rama
propia y un Pull Request revisado por el otro integrante.

**Convención de nombres de ramas:**

| Prefijo | Para qué | Ejemplo |
|---------|----------|---------|
| `feature/` | Nueva funcionalidad o mejora | `feature/grafico-rachas` |
| `fix/` | Corrección de un bug | `fix/racha-cambio-de-mes` |
| `docs/` | Solo documentación | `docs/calidad` |
| `chore/` | Tooling, config, mantenimiento | `chore/limpiar-node-modules` |

**Pasos para cada cambio:**

1. Crear un **issue** describiendo la tarea (título claro, descripción y asignado).
2. Crear una rama desde `Develop` siguiendo la convención de arriba.
3. Trabajar y commitear con mensajes descriptivos.
4. Abrir un **Pull Request** hacia `Develop` que referencie el issue (`Closes #N`).
   Se completa la plantilla de PR con su checklist.
5. El otro integrante **revisa** el PR (al menos un comentario concreto) y aprueba.
6. Se mergea solo si el **pipeline de CI está en verde**.

## CI/CD

En cada push o PR a `main`/`Develop`, GitHub Actions corre el pipeline
(`.github/workflows/ci.yml`): **lint → tests unitarios → tests E2E → build**.
El **deploy a producción (Vercel)** solo ocurre en pushes a `main` y únicamente si
todo el pipeline pasó. El detalle de cada paso y las decisiones de diseño están en
[`CALIDAD.md`](./CALIDAD.md).

### Secrets necesarios (configurar en GitHub → Settings → Secrets and variables → Actions)

Para que el deploy automático funcione hay que cargar tres secrets, que se obtienen
del proyecto en Vercel:

| Secret | De dónde sale |
|--------|---------------|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → *Create Token* |
| `VERCEL_ORG_ID` | Archivo `.vercel/project.json` tras correr `vercel link` (campo `orgId`) |
| `VERCEL_PROJECT_ID` | Mismo archivo `.vercel/project.json` (campo `projectId`) |
