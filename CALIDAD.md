# Calidad y Automatización — Habit Tracker

Este documento explica las decisiones que tomamos para asegurar la calidad del
proyecto: qué probamos, con qué herramientas, cómo funciona el pipeline de CI/CD
y qué cosas decidimos dejar afuera (y por qué). No es un archivo de configuración:
es el razonamiento detrás de la configuración.

---

## 1. Estrategia general

La app es un seguimiento de hábitos donde lo que más le importa al usuario es que
**sus datos y su progreso no se rompan**: que un hábito que marcó siga marcado, que
la racha que viene sosteniendo se calcule bien, y que nadie sin sesión pueda ver el
dashboard de otro.

Partiendo de eso, decidimos **concentrar el esfuerzo de testing en la lógica de
negocio y en los flujos críticos de navegación**, en vez de intentar cubrir cada
componente visual. El razonamiento:

- La **lógica de negocio** (cálculo de rachas, marcar/desmarcar cumplimientos,
  alta de hábitos) es donde un bug pasa desapercibido y corrompe datos silenciosamente.
  Es código puro, fácil de testear y de alto valor: lo cubrimos con **tests unitarios**.
- La **UI** cambia seguido y testearla pixel a pixel es frágil; en cambio, los
  **flujos de usuario** (entrar, ser redirigido si no tenés sesión, llegar al registro)
  son estables y representan lo que el usuario realmente hace: los cubrimos con
  **un par de tests E2E** que ejercitan la app de punta a punta en un navegador real.
- Sobre todo eso pusimos una **red automática**: lint para frenar errores de tipos
  y estilo antes de que lleguen a correr, y un **pipeline de CI/CD** que no deja
  desplegar nada que no haya pasado lint + tests + build.

La idea de fondo es la del TP: que **si algo se rompe, lo sepamos nosotros antes que
el usuario**, y que a producción solo llegue código verificado automáticamente.

---

## 2. Herramientas seleccionadas

| Necesidad | Herramienta elegida | Por qué |
|-----------|---------------------|---------|
| Tests unitarios | **Vitest** | Es el runner nativo del ecosistema Vite/Astro: usa la misma config y transforma TS/ESM sin setup extra. Frente a **Jest**, evita el dolor de configurar Babel/ts-jest y los problemas de ESM. La API (`describe/it/expect`) es prácticamente igual, así que no perdimos nada. |
| Entorno DOM para unitarios | **jsdom** | La capa de datos usa `localStorage`. jsdom nos da un `window`/`localStorage` reales en Node para testear esas funciones sin un navegador. |
| Tests E2E | **Playwright** | Maneja solo el ciclo de levantar la app y esperar a que responda (`webServer`), corre headless en CI sin configuración extra y tiene buenos selectores por rol/accesibilidad. Evaluamos **Cypress**, pero Playwright es más liviano en CI y su `webServer` integrado nos evitó scripts de arranque manuales. |
| Lint / chequeo de tipos | **ESLint** (flat config) + **`astro check`** | ESLint con `typescript-eslint` cubre el JS/TS/React; `astro check` agrega el chequeo de tipos de los archivos `.astro` (que ESLint solo no valida del todo). Juntos atrapan tanto errores de estilo como de tipos. |
| CI/CD | **GitHub Actions** | Está integrado al repo, sin servicios externos. El modelo de jobs con `needs` nos permite expresar de forma natural "el deploy depende de que todo lo anterior pase". |
| Deploy | **Vercel CLI + token** | Lo corremos *desde* el pipeline para que el deploy solo ocurra si los tests pasaron. Descartamos la integración automática nativa de Vercel (deploya con cada push) porque **no respeta** la condición "desplegar solo si el pipeline está verde", que es justamente lo que pide el TP. |
| Cobertura | **@vitest/coverage-v8** | Provider de cobertura nativo de Vitest (V8), sin instrumentación extra. Lo usamos para medir cuánto de la lógica de negocio está realmente cubierto. |

---

## 3. Tests desarrollados

### Unitarios (Vitest) — `tests/unit/store.test.ts`

Cubren la capa de datos y lógica de negocio en `src/lib/store.ts` (14 tests):

| Test | Qué valida |
|------|------------|
| `toKey` formatea con ceros a la izquierda | Que una fecha se serialice como `YYYY-MM-DD` (ej. `2025-03-05`), clave con la que se guardan los cumplimientos. |
| `toKey` usa el día local, no UTC | Que un horario nocturno (23:59) no "salte" al día siguiente por zona horaria — un bug típico que rompería las rachas. |
| `addHabit` crea con id y `createdAt` | Que al crear un hábito reciba identificador y fecha de alta, y se persista. |
| `addHabit` recorta el nombre y aplica frecuencia por defecto | Que `"  Meditar  "` se guarde como `"Meditar"` y la frecuencia sea `daily` si no se especifica. |
| `addHabit` asigna ícono y color por defecto | Que siempre haya ícono y un color válido (`#rrggbb`) aunque el usuario no elija. |
| `updateHabit` actualiza solo el hábito indicado | Que editar un hábito no toque a los demás. |
| `deleteHabit` borra también sus registros | Que al eliminar un hábito no queden cumplimientos huérfanos en el storage. |
| `toggleLog`/`isDone` marca y desmarca | Que tocar un hábito lo marque como cumplido y volver a tocarlo lo desmarque (toggle). |
| `isDone` no confunde días | Que un cumplimiento de hoy no aparezca como hecho en otro día. |
| `currentStreak` cuenta días consecutivos | Que 3 días seguidos cumplidos den racha de 3. |
| `currentStreak` mantiene la racha si hoy no marcaste | Que la racha siga viva contando desde ayer mientras el día no terminó. |
| `currentStreak` corta con un día faltante | Que un día sin cumplir corte la racha (no cuente días no consecutivos). |
| `currentStreak` devuelve 0 sin registros recientes | Que una racha vieja sin continuidad dé 0. |
| `lastNDays` devuelve N días ordenados | Que la ventana de días para el calendario esté completa y ordenada. |

### E2E (Playwright) — `tests/e2e/`

| Test | Qué valida |
|------|------------|
| `auth-redirect.spec.ts` — usuario no autenticado redirigido a `/login` | Que un visitante sin sesión que entra a `/dashboard` sea redirigido al login y vea el formulario. Es la **protección de rutas privadas**. |
| `home-navigation.spec.ts` — home → registro | Que la landing cargue y que el CTA principal del hero lleve correctamente a `/register`. Cubre el **flujo de entrada** de un usuario nuevo. |

---

## 4. Casos de uso críticos

Priorizamos proteger, en este orden:

1. **Integridad del progreso del usuario (rachas y cumplimientos).** Es el corazón
   del producto: si la racha se calcula mal o un cumplimiento se pierde, la app deja
   de cumplir su única promesa. Por eso es lo más cubierto por unitarios, incluyendo
   los casos borde (cambio de día por zona horaria, racha viva sin marcar hoy, corte
   de racha).
2. **Protección de rutas privadas.** Que alguien sin sesión no acceda al dashboard.
   Lo cubrimos con E2E porque depende de la interacción real entre el cliente, la
   sesión de Supabase y el redirect del navegador — algo que un unitario no captura.
3. **Flujo de alta de un usuario nuevo (entrada → registro).** Es el primer contacto;
   si se rompe, no hay usuario. Lo cubrimos con E2E de navegación.

Dejamos **deliberadamente en segundo plano** el detalle visual de los componentes y
los estados intermedios de formularios: son los que más cambian y los que menos daño
silencioso causan si fallan (un error visual se ve; un cálculo de racha mal, no).

---

## 5. Pipeline de CI/CD

Definido en `.github/workflows/ci.yml`. Se dispara en **cada push o PR a `main` y
`Develop`**.

### Job `quality` (lint → tests → build)

Corre en este orden y **si un paso falla, los siguientes no se ejecutan**:

1. **`npm ci`** — instala dependencias de forma reproducible desde el lockfile.
2. **Lint** (`npm run lint`) — ESLint + `astro check`. Frena errores de tipos/estilo
   antes de gastar tiempo en correr tests.
3. **Tests unitarios con cobertura** (`npm run test:coverage`).
4. **Instalación del navegador** de Playwright (`chromium`).
5. **Tests E2E** (`npm run test:e2e`) — Playwright buildea y levanta la app real.
6. **Build de producción** (`npm run build`) — valida que la app compile.

### Job `deploy` (deploy a Vercel)

- **`needs: quality`** → solo arranca si `quality` pasó entero.
- **`if: push a main`** → solo deploya en pushes a `main`, no en PRs ni en `Develop`.
- Usa la **Vercel CLI** con `VERCEL_TOKEN` para hacer `pull → build → deploy --prod`.

### Decisiones de diseño

- **El deploy depende de los tests (`needs`).** Es la regla central del TP: a
  producción no llega nada que no haya pasado lint + tests + build. Si un test falla,
  el job `quality` queda rojo y `deploy` ni se ejecuta.
- **Si falla el lint, se corta todo.** Lo pusimos primero a propósito: es el paso más
  barato y rápido, así que filtra errores triviales sin gastar minutos de CI en tests.
- **Deploy solo desde `main`.** `Develop` integra features y corre el pipeline de
  calidad, pero producción se actualiza únicamente al mergear a `main`. Así separamos
  "validar" (en cada rama) de "publicar" (solo en `main`).
- **Se puede demostrar el fallo.** Un PR que rompa un test deja el check en rojo y
  bloquea el merge: el pipeline falla de forma visible, tal como pide la consigna.

---

## 6. Cobertura

Medida con `npm run test:coverage` sobre la lógica de negocio (`src/lib/store.ts`):

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
store.ts  |  83.19  |   85.00  |  94.11  |  83.19
```

**83% de líneas / 94% de funciones** sobre la lógica de negocio, por encima del 60%
sugerido como extra. Lo que queda sin cubrir son sobre todo ramas defensivas (el
fallback de generación de id cuando no hay `crypto`, los `catch` de lectura de
storage) y la función `currentWeek` (armado de la grilla semanal de la UI), que
priorizamos menos por ser presentacional.

---

## 7. Uso de IA

Usamos un agente de IA (Claude) como apoyo para **acelerar la puesta a punto del
tooling y la primera versión de los tests**. Concretamente:

- **Qué generó:** el andamiaje de configuración (Vitest, Playwright, ESLint), una
  primera tanda de tests unitarios sobre `store.ts`, los dos tests E2E y el borrador
  de este documento.
- **Qué revisamos/ajustamos nosotros:** validamos que cada test pruebe comportamiento
  real (no asserts triviales), corregimos el orden del pipeline para que los E2E
  buildeen antes de correr, decidimos el alcance de la cobertura y qué casos borde de
  rachas valían la pena, y elegimos las herramientas según los criterios de la sección 2.
- **Por qué:** nos permitió enfocar el tiempo en *entender y decidir* (qué proteger y
  por qué) en lugar de en el boilerplate. Cada test y cada decisión de este documento
  los podemos explicar línea por línea en la defensa.

---

## 8. Limitaciones y deuda técnica

Cosas que sabemos que quedaron flojas o sin cubrir, asumidas como riesgo consciente:

- **No hay E2E del login real.** El test de auth cubre el caso *no autenticado*
  (redirect), pero no el login exitoso, porque requeriría un usuario de prueba con
  credenciales en Supabase y manejar esas credenciales como secret en CI. Lo dejamos
  como mejora futura (seedear un usuario de test y un `.env` de CI).
- **La capa de datos de hábitos es un mock sobre `localStorage`.** `store.ts` todavía
  persiste en el navegador (la migración a tablas reales de Supabase está pendiente
  del lado del front). Nuestros tests cubren la implementación actual; cuando se migre
  a Supabase habrá que reescribir esos tests contra el backend real.
- **Credenciales de Supabase hardcodeadas** en `src/lib/supabase.ts` (es la anon key
  pública, pero lo correcto sería leerla de variables de entorno). Conveniente para
  el TP porque deja correr build y E2E en CI sin secrets, pero es deuda a saldar.
- **Cobertura solo sobre `store.ts`.** No medimos cobertura de `auth.ts` (envuelve el
  SDK de Supabase) ni de los componentes React. Es una decisión de foco, no un olvido.
- **`node_modules/` quedó parcialmente trackeado en el repo** de etapas anteriores.
  Es deuda de higiene del repositorio; conviene removerlo del control de versiones
  (`git rm -r --cached node_modules`) para mantener el historial limpio.
- **El lint es relativamente permisivo** (permitimos `any` por el SDK de Supabase y
  `no-unused-vars` como warning). Con más tiempo ajustaríamos las reglas para ser más
  estrictos sin generar ruido en el código existente.
