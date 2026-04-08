/**
 * ═══════════════════════════════════════════════════════════════
 * ai.schema.ts — Schemas de validación para endpoints de IA
 * ═══════════════════════════════════════════════════════════════
 */

import { z } from "zod";

/**
 * recommendHabitsSchema — Valida el body de POST /api/ai/recommend.
 *
 * El usuario envía un mensaje describiendo su objetivo o estado actual.
 * IA lo procesa y sugiere hábitos relevantes.
 */
export const recommendHabitsSchema = z.object({
    message: z
        .string()
        .min(1, "Mensaje requerido")
        .max(500, "El mensaje no puede exceder 500 caracteres")
        .transform((msg: string) => msg.trim()),
    history: z.array(
        z.object({
            role: z.enum(["user", "model"]),
            text: z.string()
        })
    ).optional(),
});

/**
 * reorganizeTasksSchema — Valida el body de POST /api/ai/reorganize.
 *
 * No requiere parámetros en el body; la reorganización usa contexto del usuario.
 * Este schema es principalmente para validación de estructura (puede estar vacío).
 */
export const reorganizeTasksSchema = z.object({}).strict();  // Rechaza keys inesperadas

export type RecommendHabitsInput = z.infer<typeof recommendHabitsSchema>;
export type ReorganizeTasksInput = z.infer<typeof reorganizeTasksSchema>;
