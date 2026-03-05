# Prompt Designer Migration Notes

## Paridad revisada
- Navegacion principal operativa para:
  - `/prompts`
  - `/nueva-fuente`
  - `/probar-endpoints`
  - `/valores`
  - `/configuracion`
  - `/changelog`
- Rutas legacy mantenidas temporalmente para compatibilidad:
  - `/new-source`, `/test-endpoints`, `/values`, `/settings`
- `Adri Stats` no aparece en navbar ni en rutas activas.
- Build de `@stealthis/prompt-designer` exitoso.
- Lint del app exitoso (solo warnings no bloqueantes).

## Diferencias intencionales vs origen
- Se mantiene un router interno ligero (`src/lib/router.tsx`) en lugar de incorporar `react-router`.
- Se agrego tolerancia de entorno para Supabase:
  - guardas de configuracion en `src/integrations/supabase/client.ts`
  - fallback de `informationSourceService` a `localStorage` cuando no hay credenciales.
- `PromptGrid` muestra warning si Supabase no esta configurado.
- `Probar endpoints` fue endurecido con validaciones de URL/protocolo/body y snippets mas robustos.

## Riesgos/pendientes tecnicos
- Bundle principal >500kb (warning de Vite) por Monaco + componentes cargados en cliente.
- Warnings de hooks en `PromptEditor`/`Values` y warnings de fast-refresh no bloquean build.
- La limpieza profunda de archivos legacy y codigo no usado queda pendiente por decision del flujo actual.

## Backlog post-migracion (sin Adri Stats)
1. Introducir code-splitting para reducir chunk principal.
2. Resolver warnings de hooks (`react-hooks/exhaustive-deps`).
3. Revisar tipado progresivo para reducir uso de `any` en modulos migrados.
4. Evaluar retiro de rutas legacy cuando no haya dependencias externas.
