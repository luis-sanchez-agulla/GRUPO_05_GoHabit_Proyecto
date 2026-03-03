import { taskService } from "@/services/task.service";
import { success, created, noContent, error } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const taskController = {
    async getAll(req: any, context: any) {
        try {
            const { user } = context;
            const tasks = await taskService.getByUser(user.id);
            return success(tasks);
        } catch (err) {
            return error(err);
        }
    },

    async getById(req: any, context: any) {
        try {
            const { user, params } = context;
            const { taskId } = await params;
            const task = await taskService.getById(taskId, user.id);
            return success(task);
        } catch (err) {
            return error(err);
        }
    },

    async create(req: any, context: any) {
        try {
            const { user, data } = context;
            const task = await taskService.create(user.id, data);
            return created(task);
        } catch (err) {
            return error(err);
        }
    },

    async update(req: any, context: any) {
        try {
            const { user, params, data } = context;
            const { taskId } = await params;
            const task = await taskService.update(taskId, user.id, data);
            return success(task);
        } catch (err) {
            return error(err);
        }
    },

    async delete(req: any, context: any) {
        try {
            const { user, params } = context;
            const { taskId } = await params;
            await taskService.delete(taskId, user.id);
            return noContent();
        } catch (err) {
            return error(err);
        }
    },

    async getCalendar(req: any, context: any) {
        try {
            const { user } = context;
            const { searchParams } = new URL(req.url);
            const from = searchParams.get("from");
            const to = searchParams.get("to");

            if (!from || !to) {
                return error(new ValidationError("Missing from or to query parameters"));
            }

            const tasks = await taskService.getCalendar(
                user.id,
                new Date(from),
                new Date(to)
            );
            return success(tasks);
        } catch (err) {
            return error(err);
        }
    }
};
