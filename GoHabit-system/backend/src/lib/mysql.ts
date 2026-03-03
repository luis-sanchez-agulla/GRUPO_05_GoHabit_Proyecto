/**
 * ═══════════════════════════════════════════════════════════════
 * mysql.ts — Cliente de base de datos MySQL (Pool de conexiones)
 * ═══════════════════════════════════════════════════════════════
 *
 * Exporta un pool de conexiones ÚNICO para toda la aplicación.
 * Utiliza variables de entorno para la configuración.
 */

import mysql from 'mysql2/promise';

// Singleton para el pool de conexiones
const globalForMySQL = globalThis as unknown as {
    pool: mysql.Pool | undefined;
};

// URL de la base de datos desde .env
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

export const pool =
    globalForMySQL.pool ??
    mysql.createPool(DATABASE_URL);

// En desarrollo, guardamos el pool en el global para evitar agotar conexiones con hot-reload
if (process.env.NODE_ENV !== 'production') {
    globalForMySQL.pool = pool;
}

/**
 * getConnection — Utilidad para obtener una conexión del pool.
 * Útil para transacciones manuales.
 */
export const getConnection = () => pool.getConnection();

/**
 * query — Utilidad para ejecutar consultas simples.
 */
export const query = (sql: string, params?: any[]) => pool.query(sql, params);

/**
 * execute — Utilidad para ejecutar sentencias preparadas.
 */
export const execute = (sql: string, params?: any[]) => pool.execute(sql, params);
