import { habitService } from "@/services/habit.service";
import { success, created, noContent, error } from "@/lib/api-response";

export const habitController = {
    async getAll(req: any, context: any) {
        try {
            const { user } = context;
            const habits = await habitService.getByUser(user.id);
            return success(habits);
        } catch (err) {
            return error(err);
        }
    },

    async getById(req: any, context: any) {
        try {
            const { user, params } = context;
            const { habitId } = await params;
            const habit = await habitService.getById(habitId, user.id);
            return success(habit);
        } catch (err) {
            return error(err);
        }
    },

    async create(req: any, context: any) {
        try {
            const { user, data } = context;
            const habit = await habitService.create(user.id, data);
            return created(habit);
        } catch (err) {
            return error(err);
        }
    },

    async update(req: any, context: any) {
        try {
            const { user, params, data } = context;
            const { habitId } = await params;
            const habit = await habitService.update(habitId, user.id, data);
            return success(habit);
        } catch (err) {
            return error(err);
        }
    },

    async delete(req: any, context: any) {
        try {
            const { user, params } = context;
            const { habitId } = await params;
            await habitService.delete(habitId, user.id);
            return noContent();
        } catch (err) {
            return error(err);
        }
    },

    async complete(req: any, context: any) {
        try {
            const { user, params, data } = context;
            const { habitId } = await params;
            // Note: withValidation already parsed the body into context.data
            const completion = await habitService.complete(habitId, user.id, data?.note, data?.image);
            return success(completion);
        } catch (err: any) {
            if (err.message?.includes('Verificación de imagen fallida')) {
                return { status: 400, body: { success: false, error: { message: err.message } } };
            }
            return error(err);
        }
    },

    async checkStreaks(req: any, context: any) {
        try {
            const { user, params } = context;
            const { habitId } = await params;
            const streak = await habitService.checkStreaks(user.id, habitId);
            return success({ streak });
        } catch (err) {
            return error(err);
        }
    }
};
