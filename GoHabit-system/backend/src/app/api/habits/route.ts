/**
 * GET  /api/habits — Listar hábitos del usuario.
 * POST /api/habits — Crear un nuevo hábito.
 */

import { withAuth } from "@/middleware/with-auth";
import { habitService } from "@/services/habit.service";
import { createHabitSchema } from "@/validations/habit.schema";
import { success, created, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { user }) => {
    try {
        const habits = await habitService.getByUser(user.id);
        return success(habits);
    } catch (err) {
        return error(err);
    }
});

export const POST = withAuth(async (req, { user }) => {
    try {
        const body = await req.json();
        const data = createHabitSchema.parse(body);
        const habit = await habitService.create(user.id, data);
        return created(habit);
    } catch (err) {
        return error(err);
    }
});
