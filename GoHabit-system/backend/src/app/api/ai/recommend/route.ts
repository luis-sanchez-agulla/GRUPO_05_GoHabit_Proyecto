/**
 * POST /api/ai/recommend - Recomendar habitos segun contexto del usuario.
 */

import { withAuth } from "@/middleware/with-auth";
import { aiController } from "@/controllers/ai.controller";

export const POST = withAuth(aiController.recommendHabits);
