import { adminService } from "@/services/admin.service";
import { createRewardSchema, updateRewardSchema } from "@/validations/reward.schema";
import { success, created, noContent, error } from "@/lib/api-response";

export const adminController = {
    async getUsers(req: any, context: any) {
        try {
            const { searchParams } = new URL(req.url);
            const page = Number(searchParams.get("page")) || 1;
            const limit = Number(searchParams.get("limit")) || 20;

            const result = await adminService.getUsers(page, limit);
            return success(result.users, 200, result.meta);
        } catch (err) {
            return error(err);
        }
    },

    async updateUserRole(req: any, context: any) {
        try {
            const { data } = context;
            const updated = await adminService.updateUserRole(data.userId, data.role);
            return success(updated);
        } catch (err) {
            return error(err);
        }
    },

    async getStats(req: any, context: any) {
        try {
            const stats = await adminService.getStats();
            return success(stats);
        } catch (err) {
            return error(err);
        }
    },

    async createReward(req: any, context: any) {
        try {
            const { data } = context;
            const reward = await adminService.createReward(data);
            return created(reward);
        } catch (err) {
            return error(err);
        }
    },

    async updateReward(req: any, context: any) {
        try {
            const { data } = context;
            const { rewardId, ...updateData } = data;
            const reward = await adminService.updateReward(rewardId, updateData);
            return success(reward);
        } catch (err) {
            return error(err);
        }
    },

    async deleteReward(req: any, context: any) {
        try {
            const { data } = context;
            await adminService.deleteReward(data.rewardId);
            return noContent();
        } catch (err) {
            return error(err);
        }
    }
};
