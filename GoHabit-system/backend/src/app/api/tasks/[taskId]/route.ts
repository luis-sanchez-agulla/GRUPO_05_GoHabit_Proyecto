/**
 * GET    /api/tasks/[taskId] — Obtener detalle de una tarea.
 * PUT    /api/tasks/[taskId] — Actualizar una tarea.
 * DELETE /api/tasks/[taskId] — Eliminar una tarea.
 */

import { withAuth } from "@/middleware/with-auth";
import { taskService } from "@/services/task.service";
import { updateTaskSchema } from "@/validations/task.schema";
import { success, noContent, error } from "@/lib/api-response";

export const GET = withAuth(async (_req, { user, params }) => {
    try {
        const task = await taskService.getById(params!.taskId, user.id);
        return success(task);
    } catch (err) {
        return error(err);
    }
});

export const PUT = withAuth(async (req, { user, params }) => {
    try {
        const body = await req.json();
        const data = updateTaskSchema.parse(body);
        const task = await taskService.update(params!.taskId, user.id, data);
        return success(task);
    } catch (err) {
        return error(err);
    }
});

export const DELETE = withAuth(async (_req, { user, params }) => {
    try {
        await taskService.delete(params!.taskId, user.id);
        return noContent();
    } catch (err) {
        return error(err);
    }
});
