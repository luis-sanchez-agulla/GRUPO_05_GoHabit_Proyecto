import { friendService } from "@/services/friend.service";
import { success, created, noContent, error } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

export const friendController = {
    async getFriends(req: any, context: any) {
        try {
            const { user } = context;
            const friends = await friendService.getFriends(user.id);
            return success(friends);
        } catch (err) {
            return error(err);
        }
    },

    async getPendingRequests(req: any, context: any) {
        try {
            const { user } = context;
            // Explicitly cast to avoid transient IDE type errors
            const srv = friendService as any;
            const requests = await srv.getPendingRequests(user.id);
            return success(requests);
        } catch (err) {
            return error(err);
        }
    },

    async sendRequest(req: any, context: any) {
        try {
            const { user, data } = context;
            const { receiverId } = data;
            const request = await friendService.sendRequest(user.id, receiverId);
            return created(request);
        } catch (err) {
            return error(err);
        }
    },

    async acceptRequest(req: any, context: any) {
        try {
            const { user, params } = context;
            const { requestId } = await params;
            const result = await friendService.respondToRequest(requestId, user.id, "ACCEPTED");
            return success(result);
        } catch (err) {
            return error(err);
        }
    },

    async rejectRequest(req: any, context: any) {
        try {
            const { user, params } = context;
            const { requestId } = await params;
            const result = await friendService.respondToRequest(requestId, user.id, "REJECTED");
            return success(result);
        } catch (err) {
            return error(err);
        }
    },

    async removeFriend(req: any, context: any) {
        try {
            const { user, params } = context;
            const { friendId } = await params;
            await friendService.removeFriend(friendId, user.id);
            return noContent();
        } catch (err) {
            return error(err);
        }
    },

    async compareProgress(req: any, context: any) {
        try {
            const { user } = context;
            const { searchParams } = new URL(req.url);
            const friendId = searchParams.get("friendId");

            if (!friendId) {
                return error(new ValidationError("Query param 'friendId' is required"));
            }

            const comparison = await friendService.compareProgress(user.id, friendId);
            return success(comparison);
        } catch (err) {
            return error(err);
        }
    }
};
