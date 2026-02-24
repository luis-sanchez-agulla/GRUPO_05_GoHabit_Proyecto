/**
 * GET /api/users/[userId] — Obtener perfil público de un usuario.
 */

import { withAuth } from "@/middleware/with-auth";
import { userService } from "@/services/user.service";
import { success, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { params }) => {
    try {
        const profile = await userService.getPublicProfile(params!.userId);
        return success(profile);
    } catch (err) {
        return error(err);
    }
});
