import { aiService } from "@/services/ai.service";
import { success, error } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const aiController = {
    async recommendHabits(req: any, context: any) {
        try {
            const { user } = context;
            const body = await req.json();
            const message = typeof body?.message === "string" ? body.message.trim() : "";

            if (!message) {
                throw new ValidationError("Validation failed", {
                    message: ["message is required"],
                });
            }

            const result = await aiService.recommendHabits(user.id, message);
            return success(result);
        } catch (err) {
            return error(err);
        }
    },

    async reorganizeTasks(req: any, context: any) {
        try {
            const { user } = context;
            const result = await aiService.reorganizeTasks(user.id);
            return success(result);
        } catch (err) {
            return error(err);
        }
    }
};
