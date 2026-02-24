/**
 * ═══════════════════════════════════════════════════════════════
 * with-auth.ts — Middleware de autenticación JWT
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué hace?
 * Protege rutas API verificando que el usuario tiene un token JWT válido.
 * Si el token es válido, inyecta los datos del usuario (id, rol)
 * en el contexto del handler para que pueda usarlos.
 *
 * ¿Cómo funciona?
 * Es una función de orden superior (Higher-Order Function / HOF):
 * envuelve al handler real y añade la capa de autenticación.
 *
 * Uso en un route.ts:
 *   // Sin autenticación (ruta pública):
 *   export async function GET(req) { ... }
 *
 *   // CON autenticación (ruta protegida):
 *   export const GET = withAuth(async (req, { user }) => {
 *     // user.id y user.role están disponibles aquí
 *     const habits = await habitService.getByUser(user.id);
 *     return success(habits);
 *   });
 *
 * Flujo interno:
 *   1. Lee el header "Authorization: Bearer <token>"
 *   2. Extrae el token (quita "Bearer ")
 *   3. Verifica la firma y expiración con verifyToken()
 *   4. Si es válido → ejecuta el handler con los datos del usuario
 *   5. Si falla → devuelve 401 Unauthorized
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";
import { error } from "@/lib/api-response";
import { UnauthorizedError } from "@/lib/errors";
import type { AuthenticatedUser } from "@/types/api";

/**
 * Tipo del handler que recibe withAuth.
 * Además del request normal, recibe un contexto con:
 *   - user: { id, role } del usuario autenticado
 *   - params?: parámetros dinámicos de la ruta (ej: { habitId: "abc" })
 */
type AuthenticatedHandler = (
    req: NextRequest,
    context: { user: AuthenticatedUser; params?: Record<string, string> }
) => Promise<NextResponse>;

/**
 * withAuth — Envuelve un handler para requerir autenticación.
 *
 * @param handler - Función que maneja la petición (solo se ejecuta si el token es válido)
 * @returns       - Nueva función que primero verifica el token y luego llama al handler
 */
export function withAuth(handler: AuthenticatedHandler) {
    return async (req: NextRequest, routeContext?: { params?: Promise<Record<string, string>> }) => {
        try {
            // 1. Leer el header Authorization de la petición HTTP
            const authHeader = req.headers.get("authorization");

            // 2. Extraer el token (quitar "Bearer " del principio)
            const token = extractTokenFromHeader(authHeader);

            // 3. Si no hay token, rechazar inmediatamente
            if (!token) {
                throw new UnauthorizedError("Missing or invalid authorization header");
            }

            // 4. Verificar que el token es válido (firma correcta + no expirado)
            const payload = verifyToken(token);

            // 5. Construir el objeto de usuario autenticado
            const user: AuthenticatedUser = {
                id: payload.sub,    // ID del usuario (viene del campo "sub" del JWT)
                role: payload.role,  // Rol del usuario (USER o ADMIN)
            };

            // 6. Resolver los params de ruta si existen (ej: [habitId] → "abc123")
            // En Next.js 15, params es una Promise que hay que resolver con await
            const resolvedParams = routeContext?.params ? await routeContext.params : undefined;

            // 7. Ejecutar el handler real con el usuario autenticado
            return handler(req, { user, params: resolvedParams });
        } catch (err) {
            // Si el error es nuestro UnauthorizedError, devolverlo tal cual
            if (err instanceof UnauthorizedError) return error(err);
            // Cualquier otro error de JWT (expirado, firma inválida, etc.)
            return error(new UnauthorizedError("Invalid or expired token"));
        }
    };
}
