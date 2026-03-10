import { NextResponse } from "next/server";

export const healthController = {
    async check(req: any, context: any) {
        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "gohabit-backend",
        });
    }
};
