/**
 * ═══════════════════════════════════════════════════════════════
 * habit.schema.ts — Schemas de validación para hábitos
 * ═══════════════════════════════════════════════════════════════
 *
 * Define la forma que deben tener los datos al crear, actualizar
 * o completar un hábito. Se validan con withValidation() o .parse().
 */

import { z } from "zod";

/**
 * createHabitSchema — Valida el body de POST /api/habits.
 *
 * Ejemplo:
 *   { "title": "Meditar", "frequency": "DAILY", "color": "#6366f1" }
 */
export const createHabitSchema = z.object({
    title: z.string().min(1, "Título requerido").max(100),
    description: z.string().max(500).optional(),
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("DAILY"),  // Diario por defecto
    targetCount: z.number().int().min(1).max(100).default(1),            // Veces por período
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal inválido").optional(),
    icon: z.string().max(30).optional(),
});

/**
 * updateHabitSchema — Valida el body de PUT /api/habits/[habitId].
 * .partial() hace que TODOS los campos sean opcionales (solo envías lo que cambias).
 * Añade isActive para poder desactivar un hábito sin eliminarlo.
 */
export const updateHabitSchema = createHabitSchema.partial().extend({
    isActive: z.boolean().optional(),
});

/**
 * completeHabitSchema — Valida el body de POST /api/habits/[habitId]/completions.
 * Solo permite un campo opcional "note" (nota del usuario al completar).
 */
export const completeHabitSchema = z.object({
    note: z.string().max(500).optional(),
});

// Tipos TypeScript inferidos automáticamente de los schemas
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CompleteHabitInput = z.infer<typeof completeHabitSchema>;
