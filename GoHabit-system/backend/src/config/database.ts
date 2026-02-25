/**
 * ═══════════════════════════════════════════════════════════════
 * database.ts — Configuración de base de datos
 * ═══════════════════════════════════════════════════════════════
 *
 * Centraliza la configuración de conexión a la base de datos.
 * En la mayoría de los casos, lib/prisma.ts es suficiente para
 * las consultas. Este archivo existe para configuraciones avanzadas
 * como pools de conexiones, réplicas de lectura, etc.
 */

import { env } from "./env";

export const databaseConfig = {
    url: env.DATABASE_URL,                        // URL de conexión MySQL
    logging: env.NODE_ENV === "development",      // Activar logs de queries solo en desarrollo
} as const;
