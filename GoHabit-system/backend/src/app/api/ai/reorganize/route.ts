/**
 * POST /api/ai/reorganize — Reorganizar tareas con IA.
 */

import { withAuth } from "@/middleware/with-auth";
import { aiService } from "@/services/ai.service";
import { success, error } from "@/lib/api-response";

export const POST = withAuth(async (_req, { user }) => {
    try {
        const result = await aiService.reorganizeTasks(user.id);
        return success(result);
    } catch (err) {
        return error(err);
    }
});
