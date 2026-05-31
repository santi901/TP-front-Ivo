# Habit Tracker 🔥

Aplicación web para seguir hábitos diarios: el usuario crea sus hábitos, los marca día a
día y visualiza su progreso (rachas, calendario). Trabajo Práctico — Aplicación Serverless.

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
