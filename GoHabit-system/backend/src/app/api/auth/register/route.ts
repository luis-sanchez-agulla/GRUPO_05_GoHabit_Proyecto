/**
 * POST /api/auth/register — Registrar nuevo usuario.
 */

import { withValidation } from "@/middleware/with-validation";
import { registerSchema } from "@/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { created, error } from "@/lib/api-response";

export const POST = withValidation(registerSchema, async (_req, { data }) => {
    try {
        const result = await authService.register(data);
        return created(result);
    } catch (err) {
        return error(err);
    }
});
