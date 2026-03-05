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

    async getUserProgress(req: any, context: any) {
        try {
            const { user } = context;
            const profile = await rewardService.getUserProgress(user.id);
            return success(profile);
        } catch (err) {
            return error(err);
        }
    },

    async redeem(req: any, context: any) {
        try {
            const { user, data } = context;
            const { rarity } = data;
            const result = await rewardService.redeem(user.id, rarity);
            return created(result);
        } catch (err) {
            return error(err);
        }
    }
};
