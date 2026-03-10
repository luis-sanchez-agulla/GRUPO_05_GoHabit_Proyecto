/**
 * GET /api/admin/users — Listar usuarios (paginado).
 * PUT /api/admin/users — Actualizar rol de usuario.
 */

import { withAuth } from "@/middleware/with-auth";
import { withRole } from "@/middleware/with-role";
import { withValidation } from "@/middleware/with-validation";
import { updateUserRoleSchema } from "@/validations/user.schema";
import { adminController } from "@/controllers/admin.controller";

export const GET = withAuth(withRole(["ADMIN"], (req, ctx) => adminController.getUsers(req, ctx)));
export const PUT = withAuth(withRole(["ADMIN"], withValidation(updateUserRoleSchema, (req, ctx) => adminController.updateUserRole(req, ctx))));
