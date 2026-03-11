/**
 * ═══════════════════════════════════════════════════════════════
 * user.schema.ts — Schemas de validación para perfil de usuario
 * ═══════════════════════════════════════════════════════════════
 */

import { z } from "zod";
import { LIMITS } from "@/lib/constants";

/**
 * updateProfileSchema — body de PUT /api/users/profile.
 * Todos los campos son opcionales (solo envías lo que quieres cambiar).
 *
 * Ejemplo: { "firstName": "Luis", "avatarUrl": "https://..." }
 */
export const updateProfileSchema = z.object({
    firstName: z.string().max(50).optional(),
    lastName: z.string().max(50).optional(),
    username: z
        .string()
        .min(LIMITS.USERNAME_MIN_LENGTH)
        .max(LIMITS.USERNAME_MAX_LENGTH)
        .regex(/^[a-zA-Z0-9_]+$/)  // Solo alfanumérico + guión bajo
        .optional(),
    avatarUrl: z.string().url("URL inválida").optional(),  // Debe ser una URL válida si se envía
});

export const updateUserRoleSchema = z.object({
    userId: z.string().min(1, "User ID requerido"),
    role: z.enum(["USER", "ADMIN"], {
        errorMap: () => ({ message: "El rol debe ser 'USER' o 'ADMIN'" }),
    }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
