/**
 * GET /api/rewards — Obtener catálogo de recompensas.
 */

import { rewardController } from "@/controllers/reward.controller";

export const GET = (req: any, ctx: any) => rewardController.getAll(req, ctx);
