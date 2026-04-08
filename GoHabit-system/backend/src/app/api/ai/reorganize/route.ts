/**
 * POST /api/ai/reorganize — Reorganizar tareas con IA.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { reorganizeTasksSchema } from "@/validations/ai.schema";
import { aiController } from "@/controllers/ai.controller";

export const POST = withAuth(withValidation(reorganizeTasksSchema, (req, ctx) => aiController.reorganizeTasks(req, ctx)));
