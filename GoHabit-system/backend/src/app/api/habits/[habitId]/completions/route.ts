/**
 * POST /api/habits/[habitId]/completions — Marcar hábito como completado.
 */

import { withAuth } from "@/middleware/with-auth";
import { habitService } from "@/services/habit.service";
import { completeHabitSchema } from "@/validations/habit.schema";
import { created, error } from "@/lib/api-response";

export const POST = withAuth(async (req, { user, params }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const data = completeHabitSchema.parse(body);
        const completion = await habitService.complete(params!.habitId, user.id, data.note);
        return created(completion);
    } catch (err) {
        return error(err);
    }
});
