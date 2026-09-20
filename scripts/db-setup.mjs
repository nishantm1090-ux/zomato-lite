import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The connection string lives in .env.local, never in Git.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const sql = neon(connectionString);
const root = dirname(dirname(fileURLToPath(import.meta.url)));

// Neon executes one statement at a time, so we split each file on ";"
// and run the statements in order. (Safe here: no ";" inside string literals.)
function splitStatements(fileContents) {
  return fileContents
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => `${s};`);
}

async function runSqlFile(filename, label) {
  const text = readFileSync(join(root, "db", filename), "utf8");
  console.log(`${label} (${filename}):`);
  for (const statement of splitStatements(text)) {
    console.log(`  > ${statement.split("\n")[0].slice(0, 70)}...`);
    await sql.query(statement);
  }
}

await runSqlFile("schema.sql", "Applying schema");
await runSqlFile("seed.sql", "Seeding data");

const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants ORDER BY id`;
const reviews = await sql`SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at DESC`;

console.log("\nrestaurants:");
console.table(restaurants);

console.log("\nreviews (newest first):");
console.table(reviews);