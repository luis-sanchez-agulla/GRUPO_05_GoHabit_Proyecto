import { NextRequest, NextResponse } from "next/server";

/**
 * Global Middleware for GoHabit Backend
 * Handles CORS and potentially other global concerns.
 */
export function middleware(req: NextRequest) {
    // 1. Get the origin from the request headers
    const origin = req.headers.get("origin") || "*";

    // 2. Define allowed CORS headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": "86400",
    };

    // 3. Handle Pre-flight (OPTIONS) requests
    if (req.method === "OPTIONS") {
        console.log(`[CORS Middleware] Handling OPTIONS for ${req.nextUrl.pathname}`);
        return new NextResponse(null, {
            status: 204,
            headers: corsHeaders,
        });
    }

    // 4. Handle regular requests
    console.log(`[CORS Middleware] Handling ${req.method} for ${req.nextUrl.pathname}`);
    const response = NextResponse.next();

    // Apply CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

/**
 * Configure which paths the middleware runs on.
 * We want it for all /api routes.
 */
export const config = {
    matcher: "/api/:path*",
};
