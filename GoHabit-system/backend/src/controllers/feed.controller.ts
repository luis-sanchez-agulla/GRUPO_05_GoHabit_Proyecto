import { feedService } from "@/services/feed.service";
import { success, error } from "@/lib/api-response";

export const feedController = {
    async getFeed(req: any, context: any) {
        try {
            const { user } = context;
            const items = await feedService.getFriendFeed(user.id);
            return success(items);
        } catch (err: any) {
            return error(err);
        }
    }
};
