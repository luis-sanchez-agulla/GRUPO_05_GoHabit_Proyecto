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
            const { userId, role } = await req.json() as { userId: string; role: "USER" | "ADMIN" };
            const updated = await adminService.updateUserRole(userId, role);
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
            const body = await req.json();
            const data = createRewardSchema.parse(body);
            const reward = await adminService.createReward(data);
            return created(reward);
        } catch (err) {
            return error(err);
        }
    },

    async updateReward(req: any, context: any) {
        try {
            const body = await req.json() as { rewardId: string;[key: string]: unknown };
            const { rewardId, ...data } = body;
            const validated = updateRewardSchema.parse(data);
            const reward = await adminService.updateReward(rewardId, validated);
            return success(reward);
        } catch (err) {
            return error(err);
        }
    },

    async deleteReward(req: any, context: any) {
        try {
            const { rewardId } = await req.json() as { rewardId: string };
            await adminService.deleteReward(rewardId);
            return noContent();
        } catch (err) {
            return error(err);
        }
    }
};
