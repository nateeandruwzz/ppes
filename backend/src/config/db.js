import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  charset: "utf8mb4",

  timezone: "+07:00"
});

// 🔎 ตรวจสอบการเชื่อมต่อ (ครั้งเดียวตอน start)
try {
  const conn = await pool.getConnection();
  conn.release();
  console.log("MySQL connected");
} catch (err) {
  console.error("MySQL connection failed");
  process.exit(1);
}

export default pool;
