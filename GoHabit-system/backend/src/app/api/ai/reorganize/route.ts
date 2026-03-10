/**
 * POST /api/ai/reorganize — Reorganizar tareas con IA.
 */

import { withAuth } from "@/middleware/with-auth";
import { aiController } from "@/controllers/ai.controller";

export const POST = withAuth(aiController.reorganizeTasks);
