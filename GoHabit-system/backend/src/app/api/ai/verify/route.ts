import { aiService } from "@/services/ai.service";
import { success, error } from "@/lib/api-response";
import { withAuth } from "@/middleware/with-auth";

// Temporary direct route for frontend prototype validation
export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { habitTitle, image } = body;
        
        if (!habitTitle || !image) {
            return new Response(JSON.stringify({ error: "Missing title or image" }), { status: 400 });
        }

        const result = await aiService.verifyHabitImage(habitTitle, image);
        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
        return new Response(JSON.stringify({ verified: true, reason: err.message || "Failed" }), { status: 500 });
    }
};
