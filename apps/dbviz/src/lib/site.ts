import path from "node:path";
import { loadResources } from "@stealthis/schema";

export const DBVIZ_SITE = "https://dbviz.stealthis.dev";
export const STEALTHIS_SITE = "https://stealthis.dev";
export const DBVIZ_NAME = "DBViz";
export const DBVIZ_TITLE = "DBViz: SQL Schema Visualizer & ERD Editor";
export const DBVIZ_DESCRIPTION =
  "Diseña esquemas relacionales, visualiza diagramas ERD, ejecuta SQL y explora schemas listos para SaaS, ecommerce, CRM, LMS y más.";
export const DBVIZ_SOCIAL_IMAGE_PATH = "/og_image.webp";
export const DBVIZ_SOCIAL_IMAGE_ALT = "DBViz preview card";
export const DBVIZ_KEYWORDS = [
  "DBViz",
  "StealThis.dev",
  "sql schema visualizer",
  "ai database design",
  "ai sql generator",
  "ai sql assistant",
  "ai schema generator",
  "erd editor",
  "erd tool online",
  "entity relationship diagram tool",
  "database diagram tool",
  "database schema visualizer",
  "database schema design",
  "database design tool",
  "database schema generator",
  "relational schema examples",
  "database schema examples",
  "postgres schema examples",
  "crow's foot diagram",
  "db diagram",
  "dbml alternative",
  "sql builder",
  "sql schema builder",
  "sql schema editor",
  "sql editor online",
  "sql editor with ai",
  "sql generator",
  "sql visualizer",
  "sql query runner",
  "sql playground online",
  "sql database designer",
  "postgres visualizer",
  "postgres schema generator",
  "postgres erd",
  "relational database designer",
  "relational database schema",
  "database modeling tool",
  "database modeling ai",
  "editor de esquemas sql",
  "visualizador de esquemas sql",
  "diagrama entidad relacion",
  "editor erd",
  "modelado de base de datos",
  "ia para sql",
  "generador sql con ia",
  "disenador de base de datos",
  "sql playground",
  "postgres schema",
  "database schemas",
] as const;

export const CONTENT_DIR = path.resolve(process.cwd(), "../../packages/content");

export async function loadDbResources() {
  const resources = await loadResources(CONTENT_DIR);
  return resources.filter((resource) => resource.category === "database-schemas");
}

export function getDbvizOrigin(site?: URL): string {
  return (site ?? new URL(DBVIZ_SITE)).toString().replace(/\/$/, "");
}
