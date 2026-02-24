/**
 * ═══════════════════════════════════════════════════════════════
 * auth.schema.ts — Schemas de validación para autenticación
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué es un schema Zod?
 * Es una "plantilla" que describe exactamente qué forma deben tener
 * los datos que envía el cliente. Si los datos no cumplen el schema,
 * Zod genera automáticamente errores detallados por cada campo.
 *
 * Estos schemas se usan con el middleware withValidation()
 * o directamente con schema.parse(body) en los route handlers.
 */

import { z } from "zod";
import { LIMITS } from "@/lib/constants";  // Límites definidos centralmente

/**
 * loginSchema — Valida el body de POST /api/auth/login.
 *
 * Ejemplo de body válido:
 *   { "email": "user@gohabit.dev", "password": "mipassword123" }
 *
 * Ejemplo de body inválido:
 *   { "email": "no-es-un-email", "password": "" }
 *   → Error: { email: ["Email inválido"], password: ["Contraseña requerida"] }
 */
export const loginSchema = z.object({
    email: z.string().email("Email inválido"),       // Debe ser un email válido (con @)
    password: z.string().min(1, "Contraseña requerida"),  // No puede estar vacío
});

/**
 * registerSchema — Valida el body de POST /api/auth/register.
 *
 * Ejemplo de body válido:
 *   {
 *     "email": "luis@gohabit.dev",
 *     "username": "luis_dev",
 *     "password": "seguro123",
 *     "firstName": "Luis"   ← opcional
 *   }
 */
export const registerSchema = z.object({
    email: z.string().email("Email inválido"),
    username: z
        .string()
        .min(LIMITS.USERNAME_MIN_LENGTH, `Mínimo ${LIMITS.USERNAME_MIN_LENGTH} caracteres`)
        .max(LIMITS.USERNAME_MAX_LENGTH, `Máximo ${LIMITS.USERNAME_MAX_LENGTH} caracteres`)
        .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),  // Sin espacios ni caracteres raros
    password: z
        .string()
        .min(LIMITS.PASSWORD_MIN_LENGTH, `Mínimo ${LIMITS.PASSWORD_MIN_LENGTH} caracteres`),
    firstName: z.string().optional(),  // Opcional: el usuario puede rellenarlo después
    lastName: z.string().optional(),
});

// Exportamos los tipos inferidos de los schemas
// z.infer<typeof schema> genera el tipo TypeScript equivalente automáticamente
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
