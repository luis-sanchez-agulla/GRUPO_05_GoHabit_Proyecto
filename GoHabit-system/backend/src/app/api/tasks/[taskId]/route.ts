/**
 * GET    /api/tasks/[taskId] — Obtener detalle de una tarea.
 * PUT    /api/tasks/[taskId] — Actualizar una tarea.
 * DELETE /api/tasks/[taskId] — Eliminar una tarea.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { updateTaskSchema } from "@/validations/task.schema";
import { taskController } from "@/controllers/task.controller";

export const GET = withAuth((req, ctx) => taskController.getById(req, ctx));
export const PUT = withAuth(withValidation(updateTaskSchema, (req, ctx) => taskController.update(req, ctx)));
export const DELETE = withAuth((req, ctx) => taskController.delete(req, ctx));
