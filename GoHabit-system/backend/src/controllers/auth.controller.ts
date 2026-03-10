import { authService } from "@/services/auth.service";
import { success, created, error } from "@/lib/api-response";

export const authController = {
    async login(req: any, { data }: any) {
        try {
            const result = await authService.login(data);
            return success(result);
        } catch (err) {
            return error(err);
        }
    },

    async register(req: any, { data }: any) {
        try {
            const result = await authService.register(data);
            return created(result);
        } catch (err) {
            return error(err);
        }
    },

    async me(req: any, context: any) {
        try {
            const { user } = context;
            const profile = await authService.getMe(user.id);
            return success(profile);
        } catch (err) {
            return error(err);
        }
    },

    async logout(req: any, context: any) {
        return success({ message: "Logged out successfully" });
    }
};
