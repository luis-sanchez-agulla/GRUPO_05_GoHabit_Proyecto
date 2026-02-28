/**
 * POST   /api/admin/rewards — Crear recompensa.
 * PUT    /api/admin/rewards — Actualizar recompensa.
 * DELETE /api/admin/rewards — Eliminar recompensa.
 */

import { withAuth } from "@/middleware/with-auth";
import { withRole } from "@/middleware/with-role";
import { adminService } from "@/services/admin.service";
import { createRewardSchema, updateRewardSchema } from "@/validations/reward.schema";
import { created, success, noContent, error } from "@/lib/api-response";

export const POST = withAuth(
    withRole(["ADMIN"], async (req, { user }) => {
        try {
            const body = await req.json();
            const data = createRewardSchema.parse(body);
            const reward = await adminService.createReward(data);
            return created(reward);
        } catch (err) {
            return error(err);
        }
    })
);

export const PUT = withAuth(
    withRole(["ADMIN"], async (req, { user }) => {
        try {
            const body = await req.json() as { rewardId: string;[key: string]: unknown };
            const { rewardId, ...data } = body;
            const validated = updateRewardSchema.parse(data);
            const reward = await adminService.updateReward(rewardId, validated);
            return success(reward);
        } catch (err) {
            return error(err);
        }
    })
);

export const DELETE = withAuth(
    withRole(["ADMIN"], async (req, { user }) => {
        try {
            const { rewardId } = await req.json() as { rewardId: string };
            await adminService.deleteReward(rewardId);
            return noContent();
        } catch (err) {
            return error(err);
        }
    })
);
