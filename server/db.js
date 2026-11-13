import mysql from "mysql2/promise";

const requiredEnv = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]?.trim());

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required database environment variable(s): ${missingEnv.join(", ")}`,
  );
}

const dbPort = Number(process.env.DB_PORT);

if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
  throw new Error("DB_PORT must be an integer between 1 and 65535.");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

export default pool;
