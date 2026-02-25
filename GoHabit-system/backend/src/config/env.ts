/**
 * ═══════════════════════════════════════════════════════════════
 * env.ts — Validación de variables de entorno con Zod
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Para qué sirve?
 * Lee las variables de entorno (process.env) y las valida al arrancar
 * la aplicación. Si falta alguna variable obligatoria o tiene un
 * formato incorrecto, la app falla INMEDIATAMENTE con un mensaje
 * claro en lugar de fallar más tarde en un punto aleatorio.
 *
 * ¿Por qué no leer process.env directamente?
 * 1. No hay autocompletado: process.env.JWT_SECRET es `string | undefined`
 * 2. No hay validación: podrías tener un JWT_SECRET vacío sin darte cuenta
 * 3. No hay tipo seguro: todo es string, pero PORT debería ser number
 *
 * Uso:
 *   import { env } from "@/config/env";
 *   console.log(env.DATABASE_URL);  // String validado, nunca undefined
 *   console.log(env.PORT);          // Number (convertido automáticamente)
 */

import { z } from "zod";  // Librería de validación de schemas

// Definimos el "schema" de las variables de entorno
// Cada campo describe qué tipo y validaciones tiene
const envSchema = z.object({
    // URL de conexión a MySQL (obligatoria, no puede estar vacía)
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // Secreto para firmar JWT (mínimo 16 caracteres por seguridad)
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),

    // Tiempo de expiración del JWT (por defecto 7 días si no se especifica)
    JWT_EXPIRES_IN: z.string().default("7d"),

    // Entorno de ejecución (solo puede ser uno de estos tres valores)
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Puerto del servidor (z.coerce.number() convierte string "3000" → number 3000)
    PORT: z.coerce.number().default(3000),
});

/**
 * parseEnv — Lee y valida las variables de entorno.
 * Si alguna variable falla la validación, muestra los errores y lanza excepción.
 */
function parseEnv() {
    const result = envSchema.safeParse(process.env);  // safeParse no lanza, devuelve éxito/error

    if (!result.success) {
        console.error("❌ Invalid environment variables:");
        console.error(result.error.flatten().fieldErrors);  // Muestra qué campos fallaron
        throw new Error("Invalid environment variables. Check server logs.");
    }

    return result.data;  // Variables tipadas y validadas
}

// Exportamos las variables validadas como un objeto tipado
// Se ejecuta UNA VEZ al importar este módulo (al arrancar la app)
export const env = parseEnv();

// Exportamos el tipo por si se necesita en otros lugares
export type Env = z.infer<typeof envSchema>;
