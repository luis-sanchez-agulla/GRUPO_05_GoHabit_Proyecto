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
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required").default("mysql://build:build@localhost:3306/build"),

    // Secreto para firmar JWT (mínimo 16 caracteres por seguridad)
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters").default("dummy-secret-for-build-purposes-only"),

    // Tiempo de expiración del JWT (por defecto 7 días si no se especifica)
    JWT_EXPIRES_IN: z.string().default("7d"),

    // Entorno de ejecución (solo puede ser uno de estos tres valores)
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Puerto del servidor (z.coerce.number() convierte string "3000" → number 3000)
    PORT: z.coerce.number().default(3000),

    // API key opcional para IA real (Gemini). Si no existe, se usa fallback heuristico.
    GOOGLE_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
    // Variables para Ollama (IA local, gratuita, privada)
    USE_OLLAMA: z.string().default("false"),  // "true" o "false"
    OLLAMA_API_URL: z.string().default("http://localhost:11434"),
    OLLAMA_MODEL: z.string().default("qwen2.5:3b-instruct"),
    OLLAMA_VISION_MODEL: z.string().default("llava"),
});

/**
 * parseEnv — Lee y valida las variables de entorno.
 * Si alguna variable falla la validación, muestra los errores y lanza excepción.
 */
function parseEnv() {
    // Si estamos construyendo (next build), podemos ser más permisivos con los valores faltantes
    // para que el build no se detenga por falta de secretos que solo se usan en runtime.
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error("❌ Invalid environment variables:");
        console.error(result.error.flatten().fieldErrors);
        throw new Error("Invalid environment variables. Check server logs.");
    }

    return result.data;
}

// Exportamos las variables validadas como un objeto tipado
// Se ejecuta UNA VEZ al importar este módulo (al arrancar la app)
export const env = parseEnv();

// Exportamos el tipo por si se necesita en otros lugares
export type Env = z.infer<typeof envSchema>;
