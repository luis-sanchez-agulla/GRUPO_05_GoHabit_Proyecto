/**
 * POST /api/auth/logout — Cerrar sesión.
 * Con JWT stateless, el logout es responsabilidad del cliente (eliminar token).
 * Este endpoint existe como punto de extensión (e.g. blacklist de tokens).
 */

import { success } from "@/lib/api-response";

export async function POST() {
    return success({ message: "Logged out successfully" });
}
