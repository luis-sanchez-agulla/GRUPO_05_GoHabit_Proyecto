/**
 * GET /api/admin/users — Listar usuarios (paginado).
 * PUT /api/admin/users — Actualizar rol de usuario.
 */

import { withAuth } from "@/middleware/with-auth";
import { withRole } from "@/middleware/with-role";
import { adminService } from "@/services/admin.service";
import { success, error } from "@/lib/api-response";

export const GET = withAuth(
    withRole(["ADMIN"], async (req, { user }) => {
        try {
            const { searchParams } = new URL(req.url);
            const page = Number(searchParams.get("page")) || 1;
            const limit = Number(searchParams.get("limit")) || 20;

            const result = await adminService.getUsers(page, limit);
            return success(result.users, 200, result.meta);
        } catch (err) {
            return error(err);
        }
    })
);

export const PUT = withAuth(
    withRole(["ADMIN"], async (req, { user }) => {
        try {
            const { userId, role } = await req.json() as { userId: string; role: "USER" | "ADMIN" };
            const updated = await adminService.updateUserRole(userId, role);
            return success(updated);
        } catch (err) {
            return error(err);
        }
    })
);
