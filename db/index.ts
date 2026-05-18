// Creates the shared MySQL connection pool used by server routes.
import mysql, { type Pool } from "mysql2/promise";

const globalForMysql = globalThis as typeof globalThis & {
  mysqlPool?: Pool;
};

const pool =
  globalForMysql.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalForMysql.mysqlPool = pool;
}

export default pool;
