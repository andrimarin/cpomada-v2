/**
 * Configuración de Base de Datos MariaDB
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'omada_payment',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  charset: 'utf8mb4'
});

/**
 * Obtener conexión del pool
 */
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

/**
 * Ejecutar query
 */
async function query(sql, values) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
}

/**
 * Iniciar transacción
 */
async function beginTransaction() {
  const connection = await getConnection();
  await connection.beginTransaction();
  return connection;
}

module.exports = {
  pool,
  getConnection,
  query,
  beginTransaction
};