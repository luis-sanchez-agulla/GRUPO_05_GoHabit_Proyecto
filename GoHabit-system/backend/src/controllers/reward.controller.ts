import { rewardService } from "@/services/reward.service";
import { success, created, error } from "@/lib/api-response";

export const rewardController = {
    async getAll(req: any, context: any) {
        try {
            const rewards = await rewardService.getAll();
            return success(rewards);
        } catch (err) {
            return error(err);
        }
    },

    

    async redeem(userId: string, rarity: string) {
        try {
            const result = await rewardService.redeem(userId, rarity);
            return created(result);
        } catch (err) {
            return error(err);
        }
    }
};
