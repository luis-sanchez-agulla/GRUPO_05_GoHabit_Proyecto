/**

* ═══════════════════════════════════════════════════════════════
 * auth.ts — Utilidades de JWT (JSON Web Token)
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué es JWT?
 * Es un estándar para crear tokens de autenticación. Cuando un usuario
 * hace login, el servidor genera un token firmado que contiene el ID
 * y rol del usuario. El cliente envía este token en cada petición
 * posterior para demostrar que está autenticado.
 *
 * Flujo:
 *   1. Usuario hace POST /api/auth/login con email y contraseña
 *   2. El servidor verifica las credenciales
 *   3. Si son correctas, genera un JWT con signToken()
 *   4. El cliente guarda el token y lo envía en el header:
 *      Authorization: Bearer <token>
 *   5. En cada petición protegida, el middleware verifica el token
 *      con verifyToken()
 */

import jwt from "jsonwebtoken";       // Librería para crear/verificar JWT
import { env } from "@/config/env";    // Variables de entorno validadas

/**
 * JwtPayload — Datos que se almacenan DENTRO del token.
 * Cuando decodificamos un token, obtenemos este objeto.
 */
export interface JwtPayload {
    sub: string;   // "subject" = ID del usuario (convención JWT estándar)
    role: string;  // Rol del usuario (USER o ADMIN)
    iat?: number;  // "issued at" = cuándo se creó el token (automático)
    exp?: number;  // "expires" = cuándo expira el token (automático)
}

/**
 * signToken — Genera un JWT firmado para un usuario.
 *
 * @param userId - ID único del usuario (UUID)
 * @param role   - Rol del usuario ("USER" o "ADMIN")
 * @returns      - Token JWT como string (ej: "eyJhbGciOi...")
 *
 * El token se firma con JWT_SECRET (un secreto que solo conoce el servidor).
 * Cualquier modificación del token lo invalida (integridad garantizada).
 */
export function signToken(userId: string, role: string): string {
    return jwt.sign(
        { sub: userId, role },  // Payload: datos dentro del token
        env.JWT_SECRET,         // Clave secreta para firmar
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions  // Tiempo de expiración (ej: "7d" = 7 días)
    );
}

/**
 * verifyToken — Verifica y decodifica un JWT.
 *
 * @param token - Token JWT recibido del cliente
 * @returns     - Payload decodificado (sub, role, iat, exp)
 * @throws      - Error si el token es inválido, expirado o fue manipulado
 */
export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

/**
 * extractTokenFromHeader — Extrae el token del header Authorization.
 *
 * El estándar HTTP es enviar el token así:
 *   Authorization: Bearer eyJhbGciOi...
 *
 * Esta función extrae solo la parte del token (después de "Bearer ").
 *
 * @param authHeader - Valor del header Authorization (puede ser null)
 * @returns          - Token extraído o null si no tiene formato válido
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7); // Quitamos "Bearer " (7 caracteres)
}
