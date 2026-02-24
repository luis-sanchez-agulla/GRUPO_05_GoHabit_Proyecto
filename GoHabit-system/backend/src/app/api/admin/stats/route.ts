/**
 * GET /api/admin/stats — Estadísticas globales del sistema.
 */

import { withAuth } from "@/middleware/with-auth";
import { withRole } from "@/middleware/with-role";
import { adminService } from "@/services/admin.service";
import { success, error } from "@/lib/api-response";

export const GET = withAuth(
    withRole(["ADMIN"], async () => {
        try {
            const stats = await adminService.getStats();
            return success(stats);
        } catch (err) {
            return error(err);
        }
    })
);
