/**
 * POST /api/ai/recommend - Recomendar habitos segun contexto del usuario.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { recommendHabitsSchema } from "@/validations/ai.schema";
import { aiController } from "@/controllers/ai.controller";

export const POST = withAuth(withValidation(recommendHabitsSchema, (req, ctx) => aiController.recommendHabits(req, ctx)));
