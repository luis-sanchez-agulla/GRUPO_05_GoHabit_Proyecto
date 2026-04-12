/**
 * POST /api/habits/[habitId]/completions — Marcar hábito como completado.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { completeHabitSchema } from "@/validations/habit.schema";
import { habitController } from "@/controllers/habit.controller";

export const POST = withAuth(withValidation(completeHabitSchema, (req, ctx) => habitController.complete(req, ctx)));

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};
