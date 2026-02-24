/**
 * GET /api/auth/me — Obtener perfil del usuario autenticado.
 */

import { withAuth } from "@/middleware/with-auth";
import { authService } from "@/services/auth.service";
import { success, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { user }) => {
    try {
        const profile = await authService.getMe(user.id);
        return success(profile);
    } catch (err) {
        return error(err);
    }
});
