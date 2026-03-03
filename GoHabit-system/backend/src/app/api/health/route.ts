/**
 * GET /api/health — Healthcheck endpoint.
 */

import { healthController } from "@/controllers/health.controller";

export const GET = (req: any, ctx: any) => healthController.check(req, ctx);
