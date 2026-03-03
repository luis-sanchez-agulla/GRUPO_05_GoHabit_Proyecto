/**
 * GET /api/admin/stats — Estadísticas globales del sistema.
 */

import { withAuth } from "@/middleware/with-auth";
import { withRole } from "@/middleware/with-role";
import { adminController } from "@/controllers/admin.controller";

export const GET = withAuth(withRole(["ADMIN"], (req, ctx) => adminController.getStats(req, ctx)));
