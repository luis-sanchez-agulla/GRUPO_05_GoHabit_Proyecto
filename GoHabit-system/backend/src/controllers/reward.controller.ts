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

    async getUserProgress(req: any, { user }: any) {
        try {
            const progress = await rewardService.getUserProgress(user.id);
            return success(progress);
        } catch (err) {
            return error(err);
        }
    },

    async redeem(req: any, { user, data }: any) {
        try {
            const { rewardId } = data;
            const result = await rewardService.redeem(user.id, rewardId);
            return created(result);
        } catch (err) {
            return error(err);
        }
    }
};
