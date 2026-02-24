/**
 * ═══════════════════════════════════════════════════════════════
 * task.schema.ts — Schemas de validación para tareas
 * ═══════════════════════════════════════════════════════════════
 */

import { z } from "zod";

/**
 * createTaskSchema — Valida el body de POST /api/tasks.
 *
 * Ejemplo:
 *   {
 *     "title": "Entregar informe",
 *     "priority": "HIGH",
 *     "dueDate": "2025-03-15T23:59:00Z"
 *   }
 */
export const createTaskSchema = z.object({
    title: z.string().min(1, "Título requerido").max(200),
    description: z.string().max(1000).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    dueDate: z.string().datetime().optional(),      // Formato ISO 8601 (validado automáticamente)
    scheduledAt: z.string().datetime().optional(),   // Fecha programada en el calendario
});

/**
 * updateTaskSchema — Valida el body de PUT /api/tasks/[taskId].
 * .partial() = todos los campos del create son opcionales.
 * Añade "status" para poder marcar la tarea como completada.
 */
export const updateTaskSchema = createTaskSchema.partial().extend({
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
