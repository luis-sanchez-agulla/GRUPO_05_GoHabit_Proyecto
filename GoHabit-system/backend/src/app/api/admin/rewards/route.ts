/**
 * POST   /api/admin/rewards — Crear recompensa.
 * PUT    /api/admin/rewards — Actualizar recompensa.
 * DELETE /api/admin/rewards — Eliminar recompensa.
 */

import { withAuth } from "@/middleware/with-auth";
import { withRole } from "@/middleware/with-role";
import { adminController } from "@/controllers/admin.controller";

export const POST = withAuth(withRole(["ADMIN"], (req, ctx) => adminController.createReward(req, ctx)));
export const PUT = withAuth(withRole(["ADMIN"], (req, ctx) => adminController.updateReward(req, ctx)));
export const DELETE = withAuth(withRole(["ADMIN"], (req, ctx) => adminController.deleteReward(req, ctx)));
