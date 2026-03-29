// ─── SQL Generator ──────────────────────────────────────────────────────────
// Pure function: SchemaTable[] → CREATE TABLE DDL string

export interface SchemaColumn {
  name: string;
  type: string;
  pk: boolean;
  fk: boolean;
  nullable: boolean;
  references?: { table: string; column: string };
}

export interface SchemaTable {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  columns: SchemaColumn[];
}

/**
 * Generate clean CREATE TABLE DDL from an array of SchemaTable objects.
 */
export function tablesToSql(tables: SchemaTable[]): string {
  return tables
    .map((table) => {
      const lines: string[] = [];

      for (const col of table.columns) {
        let line = `  ${col.name} ${col.type}`;
        if (!col.nullable && !col.pk) {
          line += " NOT NULL";
        }
        if (col.pk) {
          line += " PRIMARY KEY";
        }
        lines.push(line);
      }

      // Table-level FOREIGN KEY constraints
      for (const col of table.columns) {
        if (col.fk && col.references) {
          lines.push(
            `  FOREIGN KEY (${col.name}) REFERENCES ${col.references.table}(${col.references.column})`
          );
        }
      }

      const body = lines.join(",\n");
      if (!body) {
        return `CREATE TABLE ${table.name} (\n);`;
      }
      return `CREATE TABLE ${table.name} (\n${body}\n);`;
    })
    .join("\n\n");
}
