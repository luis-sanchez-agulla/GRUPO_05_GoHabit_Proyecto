import { userService } from "@/services/user.service";
import { success, error } from "@/lib/api-response";
import { updateProfileSchema } from "@/validations/user.schema";

export const userController = {
    async getProfile(req: any, context: any) {
        try {
            const { user } = context;
            const profile = await userService.getProfile(user.id);
            return success(profile);
        } catch (err) {
            return error(err);
        }
    },

    async getUsers(req: any, context: any) {
        try {
            const users = await userService.getAll();
            return success(users);
        } catch (err) {
            return error(err);
        }
    },

    async getPublicProfile(req: any, context: any) {
        try {
            const { params } = context;
            const { userId } = await params;
            const profile = await userService.getPublicProfile(userId);
            return success(profile);
        } catch (err) {
            return error(err);
        }
    },

    async updateProfile(req: any, context: any) {
        try {
            const { user, data } = context;
            const profile = await userService.updateProfile(user.id, data);
            return success(profile);
        } catch (err) {
            return error(err);
        }
    }
};
