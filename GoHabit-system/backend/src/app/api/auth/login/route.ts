/**
 * POST /api/auth/login — Iniciar sesión.
 */

import { withValidation } from "@/middleware/with-validation";
import { loginSchema } from "@/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { success, error } from "@/lib/api-response";

export const POST = withValidation(loginSchema, async (_req, { data }) => {
    try {
        const result = await authService.login(data);
        return success(result);
    } catch (err) {
        return error(err);
    }
});
