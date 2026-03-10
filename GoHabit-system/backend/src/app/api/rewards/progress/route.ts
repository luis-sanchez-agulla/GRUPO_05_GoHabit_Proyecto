/**
 * GET /api/rewards/progress — Obtener progreso del usuario (puntos, monedas, nivel).
 */

import { withAuth } from "@/middleware/with-auth";
import { rewardController } from "@/controllers/reward.controller";

export const GET = withAuth((req, ctx) => rewardController.getUserProgress(req, ctx));
