/**
 * GET /api/users — Obtener perfil del usuario autenticado.
 */

import { withAuth } from "@/middleware/with-auth";
import { userService } from "@/services/user.service";
import { success, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { user }) => {
    try {
        const profile = await userService.getProfile(user.id);
        return success(profile);
    } catch (err) {
        return error(err);
    }
});
