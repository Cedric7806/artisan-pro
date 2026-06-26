import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL est requis pour appliquer le schema PostgreSQL.");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  const schema = await readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8");
  await client.query(schema);
  await client.end();
  console.log("Schema PostgreSQL applique.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
