import { withAuth } from "@/middleware/with-auth";
import { feedController } from "@/controllers/feed.controller";

export const GET = withAuth((req, ctx) => feedController.getFeed(req, ctx));
