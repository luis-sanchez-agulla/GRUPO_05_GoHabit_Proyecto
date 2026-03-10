/**
 * POST /api/rewards/redeem — Canjear una recompensa.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { redeemRewardSchema } from "@/validations/reward.schema";
import { rewardController } from "@/controllers/reward.controller";

export const POST = withAuth(withValidation(redeemRewardSchema, (req, ctx) => rewardController.redeem(req, ctx)));
