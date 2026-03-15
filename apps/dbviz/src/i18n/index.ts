export type Locale = "en" | "es";
export const LOCALE_STORAGE_KEY = "dbviz-locale";

const translations = {
  en: {
    // General / Shared
    "error.unknown": "Unknown error",

    // Tab Labels
    "tab.diagram": "Diagram",
    "tab.erd": "ERD",
    "tab.schema": "Schema",
    "tab.seed": "Seed",
    "tab.queries": "Queries",
    "tab.migrations": "Migrations",
    "tab.results": "Results",

    // Top Toolbar
    "toolbar.reset": "Reset",
    "toolbar.resetExample": "Reset example",
    "toolbar.view": "View",
    "toolbar.apply": "Apply",
    "toolbar.applying": "Applying...",

    // Engine Messages
    "engine.ready":
      "DBViz ready. Load an example and run SQL commands.",
    "engine.notInitialized": "SQL engine not initialized.",
    "engine.initializing": "Initializing engine ({reason})...",
    "engine.initialized": "Engine ready ({reason}).",
    "engine.schemaApplied": "Engine initialized: schema {status}.",
    "engine.applied": "applied",
    "engine.empty": "empty",
    "engine.seedApplied": " + seed applied",
    "engine.error": "Engine error: {message}",
    "engine.initFailed": "Failed to initialize SQL engine: {message}",
    "engine.externalRuntime":
      "Active runtime is external (docker/supabase). Use the suggested command to validate/import.",
    "engine.sqlLocalOnly":
      "SQL commands in UI are only available with local+pglite runtime.",
    "engine.noSql": "No SQL to execute. Write a command first.",
    "engine.notReady":
      "SQL engine not ready. Apply schema + seed first.",
    "engine.commandExecuted":
      "Command executed ({count} statement(s), {rows} row(s) returned).",
    "engine.sqlError": "Error executing SQL: {message}",
    "engine.supabaseScaffold":
      "Supabase active in CLI scaffold mode. Run check/import from terminal.",
    "engine.supabaseNotConfigured":
      "Supabase not configured. Define DBVIZ_SUPABASE_DB_URL.",
    "engine.dockerCli":
      "Docker active in CLI mode. Run `bun run dbviz:validate`.",

    // Export
    "export.button": "Export",
    "export.all": "Export all",
    "export.noContent": "No content in {file} to export.",
    "export.exported": "Exported: {file}",
    "export.allExported": "All artifacts exported.",

    // Example Loading
    "example.loaded": "Example loaded: {title}",
    "example.reset": "Reset: {title}",

    // AI Chat
    "ai.label": "AI",
    "ai.designer": "Designer",
    "ai.settings": "Settings",
    "ai.settingsTitle": "AI provider settings",
    "ai.refreshModels": "Refresh models",
    "ai.autoGenerate": "Auto",
    "ai.autoGenerateQueries": "Auto-generate queries",
    "ai.newSession": "New session",
    "ai.new": "New",
    "ai.unsavedWork": "Unsaved AI work",
    "ai.confirmNewSession":
      "Start a new session? Current AI-generated work will be cleared from the chat.",
    "ai.modelsLoaded": "{provider}: {count} model(s) loaded.",
    "ai.providerError": "{provider}: {error}",

    // AI Context
    "ai.context.schema": "Schema",
    "ai.context.queries": "Queries",

    // AI Chat Empty State
    "ai.empty.describeDb": "Describe your database",
    "ai.empty.describeDbHint":
      "Be specific or be vague \u2014 the AI will ask clarifying questions if it needs more detail before generating.",
    "ai.empty.generateQueries": "Generate queries for your schema",
    "ai.empty.generateQueriesHint":
      "Ask questions, plan query strategies, or generate SQL queries based on the current schema.",
    "ai.empty.loadSchemaFirst": "Load or create a schema first.",
    "ai.empty.connectFirst":
      "Connect an AI provider first (Settings).",
    "ai.noSchema":
      "No schema available. Create or load a schema first, then switch to Queries context.",

    // AI Status
    "ai.status.evaluating": "Evaluating your request...",
    "ai.status.generating": "Generating schema...",
    "ai.status.generatingOk": "Got it, generating your schema...",

    // AI Mode Labels
    "ai.mode.ask": "Ask",
    "ai.mode.plan": "Plan",
    "ai.mode.execute": "Execute",
    "ai.mode.stop": "Stop",

    // AI Mode Descriptions
    "ai.modeDesc.queryAsk": "Query questions",
    "ai.modeDesc.queryPlan": "Query strategy",
    "ai.modeDesc.queryExecute": "Generate queries",
    "ai.modeDesc.schemaAsk": "Questions only",
    "ai.modeDesc.schemaPlan": "Architecture",
    "ai.modeDesc.schemaExecute": "Generate SQL",

    // AI Placeholders
    "ai.ph.queryAsk": "Ask about querying this schema...",
    "ai.ph.queryPlan":
      "What queries do you need? Describe the use case...",
    "ai.ph.queryExecute":
      "Describe the queries you need, or say 'generate'...",
    "ai.ph.schemaAsk": "Ask a question about your schema design...",
    "ai.ph.schemaPlan":
      "Describe what you want to build \u2014 entities, relationships, purpose...",
    "ai.ph.schemaRefine":
      "Refine, add tables, change relationships...",
    "ai.ph.schemaGenerate":
      "Describe your database or say 'generate' to run the plan...",

    // AI Output Messages
    "ai.output.queriesGenerated":
      "Generated queries and added to the Queries tab. The first query is ready in the SQL bar.",
    "ai.output.queriesFailed":
      "Could not extract queries from the response. Try rephrasing.",
    "ai.output.artifactsFailed":
      "Could not extract artifacts from the response. Try rephrasing.",
    "ai.output.generated":
      "Generated: {parts}. Review the artifacts and apply to engine when ready. You can ask me to refine or add more tables.",
    "ai.output.autoGeneratePrompt":
      "Auto-generate useful queries for the current schema",

    // Results Tab
    "results.noResults": "No results yet",
    "results.executeHint":
      "Execute a SQL command to see rows here.",
    "results.noColumns": "No columns to display.",
    "results.showing": "Showing {shown} of {total} rows.",
    "results.statement": "Statement #{num}",
    "results.rows": "{count} row(s)",
    "results.affected": "{count} affected",

    // Migrations Tab
    "migrations.snapshot": "Snapshot",
    "migrations.history": "History",
    "migrations.noMigrations":
      "No migrations yet. Execute a SQL command to log it.",

    // Diagram Tab
    "diagram.viewSource": "View source",

    // Bottom Bar
    "bottom.console": "Console",
    "bottom.close": "Close",
    "bottom.run": "Run",
    "bottom.running": "Running...",

    // Settings Drawer
    "settings.title": "AI Provider Settings",
    "settings.close": "Close",
    "settings.provider": "Provider",
    "settings.ollamaUrl": "Ollama URL",
    "settings.baseUrl": "Base URL",
    "settings.apiKey": "API Key",
    "settings.getKey": "Get key",
    "settings.apiKeyHint":
      "Stored in localStorage. Never sent to our servers.",
    "settings.loadModels": "Load Models",
    "settings.loadingModels": "Loading models...",
    "settings.model": "Model",
    "settings.status": "Status:",
    "settings.modelsAvailable": "{count} model(s) available",
    "settings.loading": "Loading...",
    "settings.connectionFailed": "Connection failed",
    "settings.notConnected": "Not connected",
    "settings.active": "Active:",

    // Diagram Canvas (SchemaDiagramCanvas)
    "canvas.noDiagramContent": "No diagram content to render.",
    "canvas.noTablesDetected":
      "No tables detected in the diagram. Make sure to use erDiagram format.",
    "canvas.parseError": "Error parsing the diagram.",
    "canvas.dragHint": "Drag tables to reposition",
    "canvas.animated": "Animated",
    "canvas.static": "Static",
    "canvas.reset": "Reset",
    "canvas.primaryKey": "Primary key",
    "canvas.foreignKey": "Foreign key",
    "canvas.relation": "Relation",
    "canvas.activeRelation": "Active relation",
    "canvas.tables": "table",
    "canvas.tablesPlural": "tables",
    "canvas.relationSingular": "relation",
    "canvas.relationsPlural": "relations",

    // ERD (CrowsFootDiagram)
    "erd.noSqlContent": "No SQL DDL content to render.",
    "erd.noTablesDetected":
      "No tables detected. Ensure the input contains valid CREATE TABLE statements.",
    "erd.parseError": "Error parsing SQL DDL.",
    "erd.dragHint": "Drag tables to reposition",
    "erd.resetLayout": "Reset layout",
    "erd.primaryKey": "Primary key",
    "erd.foreignKey": "Foreign key",
    "erd.exactlyOne": "Exactly one",
    "erd.oneToMany": "One-to-many",
    "erd.zeroOrMany": "Zero-or-many",
    "erd.active": "Active",
    "erd.tables": "table",
    "erd.tablesPlural": "tables",
    "erd.relationship": "relationship",
    "erd.relationshipsPlural": "relationships",

    // Help Chat
    "help.title": "Help / Ayuda",
    "help.subtitle": "Ask anything about DbViz",
    "help.close": "Close",
    "help.emptyHint": "Ask me how to use DbViz!",
    "help.placeholder": "Ask about DbViz...",
    "help.send": "Send",
    "help.configureFirst":
      "Please configure an AI provider in **Settings** first (top-right button).",
    "help.q1": "How do I connect an AI provider?",
    "help.q2": "How do I generate a database schema?",
    "help.q3": "How do I run SQL queries?",
    "help.q4": "How do I export my schema?",

    // ERD Context Menu
    "erd.ctx.addTable": "Add table",
    "erd.ctx.addColumn": "Add column",
    "erd.ctx.renameTable": "Rename table",
    "erd.ctx.deleteTable": "Delete table",
    "erd.ctx.editColumn": "Edit column",
    "erd.ctx.deleteColumn": "Delete column",
    "erd.ctx.promptTableName": "Table name:",
    "erd.ctx.promptColumnDef": "Column (name type):",
    "erd.ctx.confirmDeleteTable": "Delete table \"{name}\"?",
    "erd.ctx.confirmDeleteColumn": "Delete column \"{name}\"?",

    // Language Switcher
    "lang.en": "EN",
    "lang.es": "ES",
    "lang.switchLabel": "Language",

    // Guided Tour
    "tour.start": "Tour",
    "tour.next": "Next",
    "tour.prev": "Previous",
    "tour.done": "Done",
    "tour.progress": "{{current}} of {{total}}",
    "tour.welcome.title": "Welcome to DbViz",
    "tour.welcome.description":
      "DbViz is a browser-based database design tool. Let's take a quick tour of the main features.",
    "tour.examples.title": "Database Examples",
    "tour.examples.description":
      "Pick a pre-built database schema to explore, or start from scratch.",
    "tour.apply.title": "Apply to Engine",
    "tour.apply.description":
      "Click Apply to load the schema and seed data into the in-browser PostgreSQL engine (PGlite).",
    "tour.engine.title": "Engine Status",
    "tour.engine.description":
      "Shows whether the SQL engine is idle, booting, ready, or in error state.",
    "tour.aiPanel.title": "AI Designer",
    "tour.aiPanel.description":
      "Chat with an AI to design schemas or generate queries. Switch between Schema and Queries context.",
    "tour.aiModes.title": "AI Modes",
    "tour.aiModes.description":
      "Ask questions, plan architecture, or execute SQL generation. Use Cmd+. to cycle modes.",
    "tour.tabs.title": "Workspace Tabs",
    "tour.tabs.description":
      "Switch between Diagram, ERD, Schema, Seed, Queries, Migrations, and Results views.",
    "tour.erdContext.title": "Interactive ERD",
    "tour.erdContext.description":
      "Right-click on the canvas to add tables, on a table header to add columns or rename, and on a column to edit or delete. Changes sync to the Schema tab instantly.",
    "tour.sqlBar.title": "SQL Command Bar",
    "tour.sqlBar.description":
      "Run ad-hoc SQL queries here. Press Cmd+Enter (or Ctrl+Enter) to execute.",
    "tour.settings.title": "AI Provider Settings",
    "tour.settings.description":
      "Configure your AI provider here — choose between Ollama (local), OpenAI, Claude, or Gemini. Set your API key and load available models.",
    "tour.langToggle.title": "Language",
    "tour.langToggle.description":
      "Switch the interface between English and Spanish.",
    "tour.theme.dark": "Dark theme",
    "tour.theme.soft": "Light theme",
  },
  es: {
    // General / Shared
    "error.unknown": "Error desconocido",

    // Tab Labels
    "tab.diagram": "Diagrama",
    "tab.erd": "ERD",
    "tab.schema": "Esquema",
    "tab.seed": "Seed",
    "tab.queries": "Consultas",
    "tab.migrations": "Migraciones",
    "tab.results": "Resultados",

    // Top Toolbar
    "toolbar.reset": "Restablecer",
    "toolbar.resetExample": "Restablecer ejemplo",
    "toolbar.view": "Ver",
    "toolbar.apply": "Aplicar",
    "toolbar.applying": "Aplicando...",

    // Engine Messages
    "engine.ready":
      "DBViz listo. Carga un ejemplo y ejecuta comandos SQL.",
    "engine.notInitialized": "Motor SQL no inicializado.",
    "engine.initializing": "Inicializando motor ({reason})...",
    "engine.initialized": "Motor listo ({reason}).",
    "engine.schemaApplied":
      "Motor inicializado: schema {status}.",
    "engine.applied": "aplicado",
    "engine.empty": "vac\u00edo",
    "engine.seedApplied": " + seed aplicado",
    "engine.error": "Error de motor: {message}",
    "engine.initFailed":
      "Fallo al inicializar motor SQL: {message}",
    "engine.externalRuntime":
      "El runtime activo es externo (docker/supabase). Usa el comando sugerido para validar/importar.",
    "engine.sqlLocalOnly":
      "Comandos SQL en UI solo est\u00e1n disponibles con runtime local+pglite.",
    "engine.noSql":
      "No hay SQL para ejecutar. Escribe un comando primero.",
    "engine.notReady":
      "El motor SQL no est\u00e1 listo. Aplica schema + seed primero.",
    "engine.commandExecuted":
      "Comando ejecutado ({count} sentencia(s), {rows} fila(s) devueltas).",
    "engine.sqlError": "Error ejecutando SQL: {message}",
    "engine.supabaseScaffold":
      "Supabase activo en modo scaffold CLI. Ejecuta check/import desde terminal.",
    "engine.supabaseNotConfigured":
      "Supabase no configurado. Define DBVIZ_SUPABASE_DB_URL.",
    "engine.dockerCli":
      "Docker activo en modo CLI. Ejecuta `bun run dbviz:validate`.",

    // Export
    "export.button": "Exportar",
    "export.all": "Exportar todo",
    "export.noContent":
      "Sin contenido en {file} para exportar.",
    "export.exported": "Exportado: {file}",
    "export.allExported": "Todos los artefactos exportados.",

    // Example Loading
    "example.loaded": "Ejemplo cargado: {title}",
    "example.reset": "Restablecido: {title}",

    // AI Chat
    "ai.label": "IA",
    "ai.designer": "Dise\u00f1ador",
    "ai.settings": "Configuraci\u00f3n",
    "ai.settingsTitle": "Configuraci\u00f3n de proveedor IA",
    "ai.refreshModels": "Actualizar modelos",
    "ai.autoGenerate": "Auto",
    "ai.autoGenerateQueries": "Auto-generar consultas",
    "ai.newSession": "Nueva sesi\u00f3n",
    "ai.new": "Nuevo",
    "ai.unsavedWork": "Trabajo IA sin guardar",
    "ai.confirmNewSession":
      "\u00bfIniciar nueva sesi\u00f3n? El trabajo generado por IA se eliminar\u00e1 del chat.",
    "ai.modelsLoaded":
      "{provider}: {count} modelo(s) cargados.",
    "ai.providerError": "{provider}: {error}",

    // AI Context
    "ai.context.schema": "Esquema",
    "ai.context.queries": "Consultas",

    // AI Chat Empty State
    "ai.empty.describeDb": "Describe tu base de datos",
    "ai.empty.describeDbHint":
      "S\u00e9 espec\u00edfico o vago \u2014 la IA har\u00e1 preguntas de aclaraci\u00f3n si necesita m\u00e1s detalle antes de generar.",
    "ai.empty.generateQueries":
      "Genera consultas para tu esquema",
    "ai.empty.generateQueriesHint":
      "Haz preguntas, planifica estrategias de consulta o genera consultas SQL basadas en el esquema actual.",
    "ai.empty.loadSchemaFirst":
      "Carga o crea un esquema primero.",
    "ai.empty.connectFirst":
      "Conecta un proveedor IA primero (Configuraci\u00f3n).",
    "ai.noSchema":
      "No hay esquema disponible. Crea o carga un esquema primero, luego cambia al contexto de Consultas.",

    // AI Status
    "ai.status.evaluating": "Evaluando tu solicitud...",
    "ai.status.generating": "Generando esquema...",
    "ai.status.generatingOk":
      "Entendido, generando tu esquema...",

    // AI Mode Labels
    "ai.mode.ask": "Preguntar",
    "ai.mode.plan": "Plan",
    "ai.mode.execute": "Ejecutar",
    "ai.mode.stop": "Detener",

    // AI Mode Descriptions
    "ai.modeDesc.queryAsk": "Preguntas de consulta",
    "ai.modeDesc.queryPlan": "Estrategia de consulta",
    "ai.modeDesc.queryExecute": "Generar consultas",
    "ai.modeDesc.schemaAsk": "Solo preguntas",
    "ai.modeDesc.schemaPlan": "Arquitectura",
    "ai.modeDesc.schemaExecute": "Generar SQL",

    // AI Placeholders
    "ai.ph.queryAsk":
      "Pregunta sobre consultar este esquema...",
    "ai.ph.queryPlan":
      "\u00bfQu\u00e9 consultas necesitas? Describe el caso de uso...",
    "ai.ph.queryExecute":
      "Describe las consultas que necesitas, o di 'generar'...",
    "ai.ph.schemaAsk":
      "Haz una pregunta sobre el dise\u00f1o de tu esquema...",
    "ai.ph.schemaPlan":
      "Describe lo que quieres construir \u2014 entidades, relaciones, prop\u00f3sito...",
    "ai.ph.schemaRefine":
      "Refinar, agregar tablas, cambiar relaciones...",
    "ai.ph.schemaGenerate":
      "Describe tu base de datos o di 'generar' para ejecutar el plan...",

    // AI Output Messages
    "ai.output.queriesGenerated":
      "Consultas generadas y agregadas a la pesta\u00f1a Consultas. La primera consulta est\u00e1 lista en la barra SQL.",
    "ai.output.queriesFailed":
      "No se pudieron extraer consultas de la respuesta. Intenta reformular.",
    "ai.output.artifactsFailed":
      "No se pudieron extraer artefactos de la respuesta. Intenta reformular.",
    "ai.output.generated":
      "Generado: {parts}. Revisa los artefactos y aplica al motor cuando est\u00e9s listo. Puedes pedirme que refine o agregue m\u00e1s tablas.",
    "ai.output.autoGeneratePrompt":
      "Auto-generar consultas \u00fatiles para el esquema actual",

    // Results Tab
    "results.noResults": "Sin resultados a\u00fan",
    "results.executeHint":
      "Ejecuta un comando SQL para ver filas aqu\u00ed.",
    "results.noColumns": "Sin columnas para mostrar.",
    "results.showing":
      "Mostrando {shown} de {total} filas.",
    "results.statement": "Sentencia #{num}",
    "results.rows": "{count} fila(s)",
    "results.affected": "{count} afectadas",

    // Migrations Tab
    "migrations.snapshot": "Snapshot",
    "migrations.history": "Historial",
    "migrations.noMigrations":
      "Sin migraciones a\u00fan. Ejecuta un comando SQL para registrarlo.",

    // Diagram Tab
    "diagram.viewSource": "Ver c\u00f3digo fuente",

    // Bottom Bar
    "bottom.console": "Consola",
    "bottom.close": "Cerrar",
    "bottom.run": "Ejecutar",
    "bottom.running": "Ejecutando...",

    // Settings Drawer
    "settings.title": "Configuraci\u00f3n de Proveedor IA",
    "settings.close": "Cerrar",
    "settings.provider": "Proveedor",
    "settings.ollamaUrl": "URL de Ollama",
    "settings.baseUrl": "URL Base",
    "settings.apiKey": "Clave API",
    "settings.getKey": "Obtener clave",
    "settings.apiKeyHint":
      "Almacenado en localStorage. Nunca se env\u00eda a nuestros servidores.",
    "settings.loadModels": "Cargar Modelos",
    "settings.loadingModels": "Cargando modelos...",
    "settings.model": "Modelo",
    "settings.status": "Estado:",
    "settings.modelsAvailable":
      "{count} modelo(s) disponibles",
    "settings.loading": "Cargando...",
    "settings.connectionFailed": "Conexi\u00f3n fallida",
    "settings.notConnected": "No conectado",
    "settings.active": "Activo:",

    // Diagram Canvas (SchemaDiagramCanvas)
    "canvas.noDiagramContent":
      "Sin contenido de diagrama para renderizar.",
    "canvas.noTablesDetected":
      "No se detectaron tablas en el diagrama. Aseg\u00farate de usar formato erDiagram.",
    "canvas.parseError": "Error al parsear el diagrama.",
    "canvas.dragHint":
      "Arrastra las tablas para reposicionarlas",
    "canvas.animated": "Animado",
    "canvas.static": "Est\u00e1tico",
    "canvas.reset": "Restablecer",
    "canvas.primaryKey": "Clave primaria",
    "canvas.foreignKey": "Clave for\u00e1nea",
    "canvas.relation": "Relaci\u00f3n",
    "canvas.activeRelation": "Relaci\u00f3n activa",
    "canvas.tables": "tabla",
    "canvas.tablesPlural": "tablas",
    "canvas.relationSingular": "relaci\u00f3n",
    "canvas.relationsPlural": "relaciones",

    // ERD (CrowsFootDiagram)
    "erd.noSqlContent":
      "Sin contenido SQL DDL para renderizar.",
    "erd.noTablesDetected":
      "No se detectaron tablas. Aseg\u00farate de que el input contenga sentencias CREATE TABLE v\u00e1lidas.",
    "erd.parseError": "Error al parsear SQL DDL.",
    "erd.dragHint":
      "Arrastra las tablas para reposicionarlas",
    "erd.resetLayout": "Restablecer dise\u00f1o",
    "erd.primaryKey": "Clave primaria",
    "erd.foreignKey": "Clave for\u00e1nea",
    "erd.exactlyOne": "Exactamente uno",
    "erd.oneToMany": "Uno a muchos",
    "erd.zeroOrMany": "Cero o muchos",
    "erd.active": "Activa",
    "erd.tables": "tabla",
    "erd.tablesPlural": "tablas",
    "erd.relationship": "relaci\u00f3n",
    "erd.relationshipsPlural": "relaciones",

    // Help Chat
    "help.title": "Ayuda / Help",
    "help.subtitle": "Pregunta lo que sea sobre DbViz",
    "help.close": "Cerrar",
    "help.emptyHint":
      "\u00a1Preg\u00fantame c\u00f3mo usar DbViz!",
    "help.placeholder": "Pregunta sobre DbViz...",
    "help.send": "Enviar",
    "help.configureFirst":
      "Por favor, configura un proveedor de IA en **Configuraci\u00f3n** primero (bot\u00f3n arriba a la derecha).",
    "help.q1":
      "\u00bfC\u00f3mo conecto un proveedor de IA?",
    "help.q2":
      "\u00bfC\u00f3mo genero un esquema de base de datos?",
    "help.q3": "\u00bfC\u00f3mo ejecuto consultas SQL?",
    "help.q4": "\u00bfC\u00f3mo exporto mi esquema?",

    // ERD Context Menu
    "erd.ctx.addTable": "Agregar tabla",
    "erd.ctx.addColumn": "Agregar columna",
    "erd.ctx.renameTable": "Renombrar tabla",
    "erd.ctx.deleteTable": "Eliminar tabla",
    "erd.ctx.editColumn": "Editar columna",
    "erd.ctx.deleteColumn": "Eliminar columna",
    "erd.ctx.promptTableName": "Nombre de tabla:",
    "erd.ctx.promptColumnDef": "Columna (nombre tipo):",
    "erd.ctx.confirmDeleteTable": "\u00bfEliminar tabla \"{name}\"?",
    "erd.ctx.confirmDeleteColumn": "\u00bfEliminar columna \"{name}\"?",

    // Language Switcher
    "lang.en": "EN",
    "lang.es": "ES",
    "lang.switchLabel": "Idioma",

    // Guided Tour
    "tour.start": "Tour",
    "tour.next": "Siguiente",
    "tour.prev": "Anterior",
    "tour.done": "Listo",
    "tour.progress": "{{current}} de {{total}}",
    "tour.welcome.title": "Bienvenido a DbViz",
    "tour.welcome.description":
      "DbViz es una herramienta de diseño de bases de datos en el navegador. Hagamos un recorrido rápido por las funciones principales.",
    "tour.examples.title": "Ejemplos de Bases de Datos",
    "tour.examples.description":
      "Elige un esquema preconstruido para explorar, o comienza desde cero.",
    "tour.apply.title": "Aplicar al Motor",
    "tour.apply.description":
      "Haz clic en Aplicar para cargar el esquema y los datos de prueba en el motor PostgreSQL del navegador (PGlite).",
    "tour.engine.title": "Estado del Motor",
    "tour.engine.description":
      "Muestra si el motor SQL está inactivo, iniciando, listo o en estado de error.",
    "tour.aiPanel.title": "Diseñador IA",
    "tour.aiPanel.description":
      "Chatea con una IA para diseñar esquemas o generar consultas. Cambia entre contexto de Esquema y Consultas.",
    "tour.aiModes.title": "Modos de IA",
    "tour.aiModes.description":
      "Haz preguntas, planifica arquitectura o ejecuta generación de SQL. Usa Cmd+. para alternar modos.",
    "tour.tabs.title": "Pestañas del Espacio de Trabajo",
    "tour.tabs.description":
      "Alterna entre Diagrama, ERD, Esquema, Seed, Consultas, Migraciones y Resultados.",
    "tour.erdContext.title": "ERD Interactivo",
    "tour.erdContext.description":
      "Haz clic derecho en el canvas para agregar tablas, en el encabezado de una tabla para agregar columnas o renombrar, y en una columna para editar o eliminar. Los cambios se sincronizan con el tab Esquema al instante.",
    "tour.sqlBar.title": "Barra de Comandos SQL",
    "tour.sqlBar.description":
      "Ejecuta consultas SQL ad-hoc aquí. Presiona Cmd+Enter (o Ctrl+Enter) para ejecutar.",
    "tour.settings.title": "Configuración del Proveedor IA",
    "tour.settings.description":
      "Configura tu proveedor de IA aquí — elige entre Ollama (local), OpenAI, Claude o Gemini. Ingresa tu API key y carga los modelos disponibles.",
    "tour.langToggle.title": "Idioma",
    "tour.langToggle.description":
      "Cambia la interfaz entre Inglés y Español.",
    "tour.theme.dark": "Tema oscuro",
    "tour.theme.soft": "Tema claro",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function useTranslations(locale: Locale) {
  return function t(key: TranslationKey): string {
    return (
      translations[locale]?.[key] ?? translations.en[key] ?? key
    );
  };
}
