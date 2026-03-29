# Local to Supabase Implementation Plan

## Objetivo
Implementar la capa de datos de `prompt-designer` con enfoque **local-first** (sin bloqueo por infraestructura) y migrar luego a Supabase sin reescribir componentes ni lógica de negocio.

## Principios
- Una sola interfaz de datos para toda la app.
- Cambiar de local a Supabase por configuración, no por cambios de UI.
- Mantener fallback seguro a local cuando Supabase no esté disponible.

## Fase 1: Provider local (inmediato)

### 1. Configuración
- Crear variable `VITE_DATA_PROVIDER=local` en `.env`.
- Mantener `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` opcionales.

### 2. Contrato de datos único
- Crear `src/data/contracts.ts` con interfaces para:
  - prompts
  - sources
  - values
  - api-config history
- Definir métodos CRUD y formatos de error.

### 3. Implementación local
- Crear `src/data/providers/localProvider.ts`.
- Usar `localStorage` como storage principal.
- Estandarizar:
  - ids
  - timestamps
  - validaciones
  - normalización de payloads

### 4. Adaptación de servicios actuales
- Hacer que `promptService`, `informationSourceService`, `valuesService`, `apiConfigService` consuman el provider (no acceso directo a Supabase en UI).
- Evitar llamadas directas a `supabase` desde componentes.

### 5. Criterio de salida Fase 1
- App funcional completa con `VITE_DATA_PROVIDER=local`.
- Sin dependencias obligatorias de Supabase para operar.

## Fase 2: Provider Supabase (cuando esté listo)

### 1. Implementación Supabase
- Crear `src/data/providers/supabaseProvider.ts`.
- Reutilizar el mismo contrato de `contracts.ts`.
- Mapear tablas/relaciones existentes del proyecto.

### 2. Selector de provider
- Crear `src/data/providerFactory.ts`:
  - si `VITE_DATA_PROVIDER=supabase` y envs válidas -> supabase
  - si faltan envs o hay fallo -> fallback a local + warning

### 3. Guardas de entorno
- Centralizar validación de envs en `src/integrations/supabase/client.ts`.
- Exponer helper para saber provider activo en runtime.

### 4. Criterio de salida Fase 2
- Misma funcionalidad con `DATA_PROVIDER=supabase`.
- Sin cambios en páginas/componentes para alternar provider.

## Fase 3: Migración de datos local -> Supabase

### 1. Export local
- Leer llaves usadas en `localStorage`.
- Validar estructura antes de enviar.

### 2. Import ordenado
- Insertar en orden:
  1. authors/tags/tools
  2. prompts
  3. prompt components/tags/tools/variables
  4. information sources y values

### 3. Reconciliación
- Mapear IDs locales a IDs remotos.
- Generar reporte de migración (éxitos/fallos).

### 4. Cutover
- Cambiar `VITE_DATA_PROVIDER=supabase`.
- Mantener fallback temporal durante estabilización.

## Estructura sugerida de archivos
- `src/data/contracts.ts`
- `src/data/providerFactory.ts`
- `src/data/providers/localProvider.ts`
- `src/data/providers/supabaseProvider.ts`
- `src/data/types.ts` (opcional para DTOs internos)

## Riesgos y mitigación
- Riesgo: divergencia entre provider local y supabase.
  - Mitigación: contrato único + tests de contrato por provider.

- Riesgo: inconsistencias en IDs al migrar.
  - Mitigación: tabla/mapa temporal localId->remoteId durante import.

- Riesgo: acoplamiento de componentes a servicios legacy.
  - Mitigación: mover todo acceso a datos al provider gradualmente.

## Checklist rápido
- [x] Definir `contracts.ts`
- [x] Implementar `localProvider`
- [x] Conectar servicios al provider
- [x] Implementar `supabaseProvider`
- [x] Implementar `providerFactory`
- [ ] Crear script de migración local->supabase
- [ ] Ejecutar pruebas end-to-end con ambos providers

## Estado inicial recomendado
- Comenzar con `VITE_DATA_PROVIDER=local`.
- Continuar desarrollo de UI/flujo sin bloqueo.
- Activar Supabase cuando esquema y credenciales estén listos.
