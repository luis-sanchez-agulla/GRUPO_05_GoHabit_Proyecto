/**
 * GET  /api/tasks — Listar tareas del usuario.
 * POST /api/tasks — Crear una nueva tarea.
 */

import { withAuth } from "@/middleware/with-auth";
import { taskService } from "@/services/task.service";
import { createTaskSchema } from "@/validations/task.schema";
import { success, created, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { user }) => {
    try {
        const tasks = await taskService.getByUser(user.id);
        return success(tasks);
    } catch (err) {
        return error(err);
    }
});

export const POST = withAuth(async (req, { user }) => {
    try {
        const body = await req.json();
        const data = createTaskSchema.parse(body);
        const task = await taskService.create(user.id, data);
        return created(task);
    } catch (err) {
        return error(err);
    }
});
