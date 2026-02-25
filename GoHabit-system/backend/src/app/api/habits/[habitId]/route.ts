/**
 * GET    /api/habits/[habitId] — Obtener detalle de un hábito.
 * PUT    /api/habits/[habitId] — Actualizar un hábito.
 * DELETE /api/habits/[habitId] — Eliminar un hábito.
 */

import { withAuth } from "@/middleware/with-auth";
import { habitService } from "@/services/habit.service";
import { updateHabitSchema } from "@/validations/habit.schema";
import { success, noContent, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { user, params }) => {
    try {
        const habit = await habitService.getById(params!.habitId, user.id);
        return success(habit);
    } catch (err) {
        return error(err);
    }
});

export const PUT = withAuth(async (req, { user, params }) => {
    try {
        const body = await req.json();
        const data = updateHabitSchema.parse(body);
        const habit = await habitService.update(params!.habitId, user.id, data);
        return success(habit);
    } catch (err) {
        return error(err);
    }
});

export const DELETE = withAuth(async (_req, { user, params }) => {
    try {
        await habitService.delete(params!.habitId, user.id);
        return noContent();
    } catch (err) {
        return error(err);
    }
});
