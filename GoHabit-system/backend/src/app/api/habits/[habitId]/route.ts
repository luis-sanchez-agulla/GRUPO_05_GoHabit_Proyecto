/**
 * GET    /api/habits/[habitId] — Obtener detalle de un hábito.
 * PUT    /api/habits/[habitId] — Actualizar un hábito.
 * DELETE /api/habits/[habitId] — Eliminar un hábito.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { updateHabitSchema } from "@/validations/habit.schema";
import { habitController } from "@/controllers/habit.controller";

export const GET = withAuth((req, ctx) => habitController.getById(req, ctx));
export const PUT = withAuth(withValidation(updateHabitSchema, (req, ctx) => habitController.update(req, ctx)));
export const DELETE = withAuth((req, ctx) => habitController.delete(req, ctx));
