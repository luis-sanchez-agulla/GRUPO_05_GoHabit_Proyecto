/**
 * GET /api/health — Healthcheck endpoint.
 */

import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "gohabit-backend",
    });
}
