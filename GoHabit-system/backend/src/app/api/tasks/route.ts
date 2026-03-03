/**
 * GET  /api/tasks — Listar tareas del usuario.
 * POST /api/tasks — Crear una nueva tarea.
 */

import { withAuth } from "@/middleware/with-auth";
import { withValidation } from "@/middleware/with-validation";
import { createTaskSchema } from "@/validations/task.schema";
import { taskController } from "@/controllers/task.controller";

export const GET = withAuth((req, ctx) => taskController.getAll(req, ctx));
export const POST = withAuth(withValidation(createTaskSchema, (req, ctx) => taskController.create(req, ctx)));
