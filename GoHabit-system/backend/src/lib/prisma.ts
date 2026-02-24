/**
 * ═══════════════════════════════════════════════════════════════
 * prisma.ts — Cliente de base de datos (Singleton)
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué hace?
 * Exporta una instancia ÚNICA de PrismaClient que se reutiliza
 * en toda la aplicación para hacer consultas a MySQL.
 *
 * ¿Por qué es singleton?
 * En desarrollo, Next.js hace "hot-reload" (recarga el código cada
 * vez que guardas un archivo). Sin este patrón, cada recarga crearía
 * una NUEVA conexión a la base de datos, agotando el pool de
 * conexiones rápidamente. Con el singleton, reutilizamos la misma
 * conexión durante toda la sesión de desarrollo.
 *
 * Uso:
 *   import { prisma } from "@/lib/prisma";
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from "@prisma/client";

// Usamos globalThis para almacenar la instancia de Prisma
// globalThis es un objeto global que persiste entre hot-reloads de Next.js
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Si ya existe una instancia en el global, la reutilizamos.
// Si no, creamos una nueva con configuración de logging.
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        // En desarrollo: mostramos las queries SQL en consola para depuración
        // En producción: solo mostramos errores para no llenar los logs
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

// Solo guardamos en el global en desarrollo (donde hay hot-reload)
// En producción no es necesario porque el proceso no se recarga
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
