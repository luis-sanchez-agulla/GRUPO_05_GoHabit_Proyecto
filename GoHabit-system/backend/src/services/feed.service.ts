import { feedRepository } from "@/repositories/feed.repository";

export const feedService = {
    async getFriendFeed(userId: string) {
        return feedRepository.getFriendFeed(userId);
    }
};
