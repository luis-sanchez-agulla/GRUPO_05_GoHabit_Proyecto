/**
 * ═══════════════════════════════════════════════════════════════
 * with-role.ts — Middleware de autorización por rol
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué diferencia hay entre autenticación y autorización?
 *   - Autenticación (withAuth): "¿Quién eres?" → verifica identidad
 *   - Autorización (withRole):  "¿Puedes hacer esto?" → verifica permisos
 *
 * Este middleware se usa DESPUÉS de withAuth para comprobar que
 * el usuario tiene el ROL necesario para acceder a la ruta.
 *
 * Uso:
 *   // Solo admins pueden acceder:
 *   export const GET = withAuth(
 *     withRole(["ADMIN"], async (req, { user }) => {
 *       // Solo llega aquí si user.role === "ADMIN"
 *       return success(await adminService.getStats());
 *     })
 *   );
 *
 *   // Admins y moderadores:
 *   withRole(["ADMIN", "MODERATOR"], handler)
 */

import { NextRequest, NextResponse } from "next/server";
import { error } from "@/lib/api-response";
import { ForbiddenError } from "@/lib/errors";
import type { AuthenticatedUser } from "@/types/api";

/** Tipo del handler que recibe withRole (idéntico al de withAuth) */
type RoleHandler = (
    req: NextRequest,
    context: { user: AuthenticatedUser; params?: Record<string, string> }
) => Promise<NextResponse>;

/**
 * withRole — Envuelve un handler para requerir un rol específico.
 *
 * @param allowedRoles - Lista de roles permitidos (ej: ["ADMIN"])
 * @param handler      - Handler que se ejecuta si el rol es válido
 * @returns            - Nueva función que verifica el rol antes de ejecutar
 */
export function withRole(allowedRoles: string[], handler: RoleHandler): RoleHandler {
    return async (req, context) => {
        // Comprobamos si el rol del usuario está en la lista de permitidos
        if (!allowedRoles.includes(context.user.role)) {
            // Si no tiene el rol, devolvemos 403 Forbidden
            return error(new ForbiddenError("Insufficient permissions"));
        }

        // Si tiene el rol, ejecutamos el handler normalmente
        return handler(req, context);
    };
}
