/**
 * ═══════════════════════════════════════════════════════════════
 * seed.ts — Script para poblar la base de datos con datos iniciales
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Cuándo se usa?
 * Se ejecuta manualmente con `npm run db:seed` para crear datos
 * de prueba en la base de datos de DESARROLLO. No se ejecuta
 * automáticamente ni en producción.
 *
 * ¿Qué crea?
 *   1. Un usuario ADMIN (admin@gohabit.dev / admin123)
 *   2. Un usuario normal de prueba (user@gohabit.dev / user123)
 *   3. Recompensas por defecto en el catálogo
 *
 * upsert: si el registro ya existe (por email), no lo duplica.
 * Así puedes ejecutar el seed varias veces sin problemas.
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// Crear una instancia de Prisma solo para el seed (no usa el singleton)
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // ── 1. Crear usuario admin ──────────────────────
    // Hasheamos la contraseña antes de guardarla
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@gohabit.dev" },  // Si ya existe, no hacer nada
        update: {},                              // No actualizar nada si existe
        create: {                                // Crear si no existe
            email: "admin@gohabit.dev",
            username: "admin",
            password: adminPassword,
            firstName: "Admin",
            lastName: "GoHabit",
            role: Role.ADMIN,                      // Rol ADMIN
            points: 0,
            coins: 0,
            level: 1,
        },
    });
    console.log(`  ✅ Admin creado: ${admin.email}`);

    // ── 2. Crear usuario de prueba ──────────────────
    const userPassword = await bcrypt.hash("user123", 10);
    const user = await prisma.user.upsert({
        where: { email: "user@gohabit.dev" },
        update: {},
        create: {
            email: "user@gohabit.dev",
            username: "testuser",
            password: userPassword,
            firstName: "Test",
            lastName: "User",
            role: Role.USER,
            points: 100,   // Empezar con algunos puntos para probar
            coins: 50,     // Empezar con monedas para probar canje
            level: 2,
        },
    });
    console.log(`  ✅ Usuario de prueba creado: ${user.email}`);
}

// Ejecutar el seed y manejar errores
main()
    .catch((e) => {
        console.error("❌ Error en seed:", e);
        process.exit(1);  // Salir con código de error
    })
    .finally(async () => {
        await prisma.$disconnect();  // Cerrar la conexión a la BD
    });
