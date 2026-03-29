# Prompt Designer Roadmap

## Progreso
- [x] Fase 1 completada — Base de migracion
- [x] Fase 2 completada — Componentes core de Prompts
- [x] Fase 3 completada — Migracion por paginas funcionales
- [x] Fase 4 completada — Cierre de migracion
- [x] Fase 5 completada — Eliminar Supabase, solo localStorage
- [x] Fase 6 completada — Fix UI/UX: responsive + layout bugs
- [x] Fase 7 completada — Sistema de inyeccion "Open in Prompt Designer"

---

## Fases completadas (1-4): Migracion desde lead-dialogue-builder

> Migracion finalizada. Todas las paginas, componentes, servicios y tipos fueron migrados.
> Paridad funcional lograda. Adri Stats excluido del alcance.

---

## Fase 5 — Eliminar Supabase, solo localStorage + inyeccion

### Objetivo
- Eliminar TODA dependencia de Supabase. El app funciona 100% con localStorage.
- Eliminar archivos, tipos, provider y dependencia de `@supabase/supabase-js`.
- Simplificar `providerFactory` para que solo use `localProvider`.

### Tareas
- [x] Eliminar `src/integrations/supabase/` (client.ts, types.ts, errorDiagnostics.ts).
- [x] Eliminar `src/data/providers/supabaseProvider.ts`.
- [x] Simplificar `src/data/providerFactory.ts` — usar directamente `localProvider`.
- [x] Eliminar `supabase/schema.sql`.
- [x] Eliminar variables `VITE_SUPABASE_*` de `.env.example`.
- [x] Eliminar `VITE_DATA_PROVIDER` (ya no hay opcion, siempre es local).
- [x] Eliminar `@supabase/supabase-js` de `package.json`.
- [x] Eliminar `LOCAL_TO_SUPABASE_PLAN.md` (ya no aplica).
- [x] Verificar que no queden imports ni referencias a Supabase en ningun archivo.
- [x] Compilacion limpia sin Supabase.

---

## Fase 6 — Fix UI/UX: responsive + layout bugs

### Objetivo
- Hacer la app completamente responsive (mobile-first).
- Corregir bugs visuales reportados en el editor de prompts.

### Problemas identificados

#### 6.1 — Responsive general
- [x] El layout del editor de prompts no es responsive.
- [x] En mobile, los elementos se cortan o no se pueden scrollear.
- [x] Sidebar + contenido principal deben adaptarse a pantallas pequenas.

#### 6.2 — Editor de prompts: contenido inferior cortado
- [x] Al cargar un prompt, los elementos de abajo (secciones, Available Tools) no se ven bien.
- [x] El area de contenido no tiene scroll correcto; se corta el contenido.
- [x] Asegurar que el contenido del editor tenga scroll completo dentro del viewport.

#### 6.3 — Consolidated Prompt: area muy pequena y botones rotos
- [x] El area de "Consolidated Prompt" en la parte inferior es demasiado pequena.
- [x] Los botones (Preview, New Section, Import, Save prompt, Test Agent, Copy, Export) se ven mal y estan apretados.
- [x] Redisenar la barra de acciones del consolidated prompt para que sea clara y usable.

#### 6.4 — Sidebar roto al ocultar
- [x] El sidebar (Tools) se dania visualmente al intentar ocultarlo.
- [x] Implementar toggle de sidebar correcto con transicion suave.
- [x] En mobile, el sidebar debe ser un drawer/overlay, no empujar el contenido.

#### 6.5 — Navbar visible dentro del editor
- [x] Al entrar al workspace/editor de un prompt, el navbar principal sigue visible arriba.
- [x] El editor debe ocupar toda la pantalla (fullscreen workspace) sin el navbar superior.
- [x] Solo mostrar la barra de navegacion del prompt (Projects ← / TOOLS / SUPPORT / etc.) sin el nav global.

### Criterios de aceptacion
- La app se ve y funciona bien en mobile (360px+), tablet (768px+) y desktop (1024px+).
- El editor de prompts ocupa todo el viewport sin navbar global.
- Sidebar toggle funciona sin bugs visuales.
- Todo el contenido del editor es scrolleable y visible.
- Los botones del consolidated prompt son legibles y accesibles en todos los tamanos.

---

## Fase 7 — Sistema de inyeccion "Open in Prompt Designer"

### Objetivo
- Desde la web principal (`apps/www`), los recursos de categoria "prompts" tendran un boton "Open in Prompt Designer".
- Similar al flujo de "Open in CodePen" que ya existe.
- Al hacer click, abre `prompt-designer` e inyecta el contenido del recurso como un prompt nuevo.

### Tareas
- [x] Definir formato de datos para inyeccion — localStorage key `pd_injected_prompt` con JSON payload.
- [x] Agregar boton "Open in Prompt Designer" en ActionMenu de recursos tipo prompt en `apps/www`.
- [x] En `prompt-designer`, detectar datos inyectados al cargar y crear un prompt temporal.
- [x] Validar flujo completo: click en www → abre prompt-designer → prompt cargado y editable.
- [x] Manejar caso: siempre abre nueva tab con `?injected=1`.

### Criterios de aceptacion
- Boton visible solo en recursos de categoria "prompts" en www.
- Click abre prompt-designer con el prompt pre-cargado.
- El usuario puede editar y guardar el prompt inyectado localmente.

---

## Orden de ejecucion
1. **Fase 5** — Eliminar Supabase (limpieza, sin cambios funcionales).
2. **Fase 6** — Fix UI/UX (responsive + bugs visuales).
3. **Fase 7** — Sistema de inyeccion "Open in Prompt Designer".
