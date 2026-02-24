/**
 * PUT /api/users/profile — Editar perfil del usuario autenticado.
 */

import { withAuth } from "@/middleware/with-auth";
import { userService } from "@/services/user.service";
import { updateProfileSchema } from "@/validations/user.schema";
import { success, error } from "@/lib/api-response";

export const PUT = withAuth(async (req, { user }) => {
    try {
        const body = await req.json();
        const data = updateProfileSchema.parse(body);
        const profile = await userService.updateProfile(user.id, data);
        return success(profile);
    } catch (err) {
        return error(err);
    }
});
