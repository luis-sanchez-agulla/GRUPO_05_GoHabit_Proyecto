/**
 * POST   /api/admin/rewards — Crear recompensa.
 * PUT    /api/admin/rewards — Actualizar recompensa.
 * DELETE /api/admin/rewards — Eliminar recompensa.
 */

import { withAuth } from "@/middleware/with-auth";
import { withRole } from "@/middleware/with-role";
import { withValidation } from "@/middleware/with-validation";
import { createRewardSchema, updateRewardSchema, deleteRewardSchema } from "@/validations/reward.schema";
import { adminController } from "@/controllers/admin.controller";

export const POST = withAuth(withRole(["ADMIN"], withValidation(createRewardSchema, (req, ctx) => adminController.createReward(req, ctx))));
export const PUT = withAuth(withRole(["ADMIN"], withValidation(updateRewardSchema, (req, ctx) => adminController.updateReward(req, ctx))));
export const DELETE = withAuth(withRole(["ADMIN"], withValidation(deleteRewardSchema, (req, ctx) => adminController.deleteReward(req, ctx))));
