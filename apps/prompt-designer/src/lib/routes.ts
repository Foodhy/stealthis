export const routes = {
  home: "/",
  prompts: "/prompts",
  promptsNew: "/prompts/new",
  promptsEdit: "/prompts/edit",
  newSource: "/new-source",
  testEndpoints: "/test-endpoints",
  values: "/values",
  settings: "/settings",
  changelog: "/changelog",
} as const;

export const legacyRouteAliases = {
  promptsNew: ["/prompts/nuevo"],
  promptsEdit: ["/prompts/editar"],
  newSource: ["/nueva-fuente"],
  testEndpoints: ["/probar-endpoints"],
  values: ["/valores"],
  settings: ["/configuracion"],
} as const;
