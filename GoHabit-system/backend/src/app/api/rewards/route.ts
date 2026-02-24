/**
 * GET /api/rewards — Obtener catálogo de recompensas.
 */

import { rewardService } from "@/services/reward.service";
import { success, error } from "@/lib/api-response";

export async function GET() {
    try {
        const rewards = await rewardService.getAll();
        return success(rewards);
    } catch (err) {
        return error(err);
    }
}
