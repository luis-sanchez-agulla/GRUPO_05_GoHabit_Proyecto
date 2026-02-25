/**
 * POST /api/rewards/redeem — Canjear una recompensa.
 */

import { withAuth } from "@/middleware/with-auth";
import { rewardService } from "@/services/reward.service";
import { redeemRewardSchema } from "@/validations/reward.schema";
import { created, error } from "@/lib/api-response";

export const POST = withAuth(async (req, { user }) => {
    try {
        const body = await req.json();
        const { rewardId } = redeemRewardSchema.parse(body);
        const result = await rewardService.redeem(user.id, rewardId);
        return created(result);
    } catch (err) {
        return error(err);
    }
});
