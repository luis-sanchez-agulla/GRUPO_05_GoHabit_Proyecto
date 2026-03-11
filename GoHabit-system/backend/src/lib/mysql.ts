/**
 * ═══════════════════════════════════════════════════════════════
 * mysql.ts — Cliente de base de datos MySQL (Pool de conexiones)
 * ═══════════════════════════════════════════════════════════════
 *
 * Exporta un pool de conexiones ÚNICO para toda la aplicación.
 * Utiliza variables de entorno para la configuración.
 */

import mysql from 'mysql2/promise';

import { env } from '@/config/env';

// Singleton para el pool de conexiones
const globalForMySQL = globalThis as unknown as {
    pool: mysql.Pool | undefined;
};

// Usamos la URL validada de nuestro config centralizado
export const pool =
    globalForMySQL.pool ??
    mysql.createPool(env.DATABASE_URL);

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
 *
 */
export const query = (sql: string, params?: any[]) => pool.query(sql, params);

/**
 * execute — Utilidad para sentencias preparadas (usa prepared statements).
 *
 */
export const execute = (sql: string, params?: any[]) => pool.execute(sql, params);
