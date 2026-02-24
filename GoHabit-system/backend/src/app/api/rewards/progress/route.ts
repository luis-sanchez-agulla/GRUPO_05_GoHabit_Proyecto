/**
 * GET /api/rewards/progress — Obtener progreso del usuario (puntos, monedas, nivel).
 */

import { withAuth } from "@/middleware/with-auth";
import { rewardService } from "@/services/reward.service";
import { success, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { user }) => {
    try {
        const progress = await rewardService.getUserProgress(user.id);
        return success(progress);
    } catch (err) {
        return error(err);
    }
});
