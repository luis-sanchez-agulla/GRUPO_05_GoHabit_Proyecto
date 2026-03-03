import { aiService } from "@/services/ai.service";
import { success, error } from "@/lib/api-response";

export const aiController = {
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
