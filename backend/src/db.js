import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// MySQL connection pool configuration (env vars in .env.example)
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z' // store dates in UTC
});

export { pool };