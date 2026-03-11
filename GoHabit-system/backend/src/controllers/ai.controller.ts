import { aiService } from "@/services/ai.service";
import { success, error } from "@/lib/api-response";

export const aiController = {
    /**
     * recommendHabits — Recomienda hábitos basados en el mensaje del usuario.
     * La validación del body (incluyendo `message`) se hace en la ruta con withValidation.
     */
    async recommendHabits(req: any, { data, user }: any) {
        try {
            const result = await aiService.recommendHabits(user.id, data.message);
            return success(result);
        } catch (err) {
            return error(err);
        }
    },

    /**
     * reorganizeTasks — Reorganiza tareas del usuario.
     * La validación del body se hace en la ruta con withValidation.
     */
    async reorganizeTasks(req: any, { data, user }: any) {
        try {
            const result = await aiService.reorganizeTasks(user.id);
            return success(result);
        } catch (err) {
            return error(err);
        }
    }
};
