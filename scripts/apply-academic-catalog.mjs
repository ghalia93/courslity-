import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = match[2].trim();
  }
}

loadEnvFile(path.join(projectRoot, ".env.local"));

const sql = fs.readFileSync(
  path.join(projectRoot, "db", "academic_catalog.sql"),
  "utf8",
);

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

try {
  await connection.query(sql);
  console.log("Academic catalog applied successfully.");
} finally {
  await connection.end();
}
