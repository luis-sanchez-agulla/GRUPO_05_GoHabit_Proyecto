/**
 * ═══════════════════════════════════════════════════════════════
 * api.d.ts — Tipos genéricos de request/response para la API
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué es un archivo .d.ts?
 * Es un archivo de "declaración de tipos" de TypeScript. Solo contiene
 * interfaces y tipos (sin lógica), que TypeScript usa para validar
 * el código en tiempo de compilación. No genera JavaScript.
 *
 * Estos tipos se usan en los route handlers y middlewares para
 * tipar las peticiones y respuestas de forma consistente.
 */

import { NextRequest } from "next/server";

/**
 * AuthenticatedUser — Datos del usuario extraídos del JWT.
 * El middleware withAuth inyecta este objeto en el contexto
 * del handler cuando el token es válido.
 */
export interface AuthenticatedUser {
    id: string;    // UUID del usuario (viene de JWT payload.sub)
    role: string;  // Rol del usuario ("USER" o "ADMIN")
}

/**
 * AuthenticatedRequest — NextRequest con información de usuario.
 * Extiende la petición estándar de Next.js añadiendo los datos
 * del usuario autenticado.
 */
export interface AuthenticatedRequest extends NextRequest {
    user: AuthenticatedUser;
}

/**
 * RouteParams — Parámetros dinámicos de las rutas API.
 *
 * En Next.js App Router, las carpetas entre corchetes como [habitId]
 * generan parámetros dinámicos. Ejemplo:
 *   Ruta: /api/habits/[habitId]/route.ts
 *   URL:  /api/habits/abc123
 *   params: { habitId: "abc123" }
 *
 * En Next.js 15, params es una Promise (hay que hacer await).
 */
export interface RouteParams<T extends Record<string, string> = Record<string, string>> {
    params: Promise<T>;
}

/**
 * PaginationMeta — Metadatos de paginación.
 * Se incluyen en el campo "meta" de respuestas paginadas.
 *
 * Ejemplo de respuesta paginada:
 * {
 *   "data": [...],
 *   "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
 * }
 */
export interface PaginationMeta {
    page: number;        // Página actual (empezando en 1)
    limit: number;       // Número de elementos por página
    total: number;       // Total de elementos en la BD
    totalPages: number;  // Total de páginas (total / limit, redondeado arriba)
}

/**
 * PaginationQuery — Query params que el cliente puede enviar
 * para controlar la paginación y ordenación de listados.
 *
 * Ejemplo: GET /api/admin/users?page=2&limit=10&sortBy=createdAt&order=desc
 */
export interface PaginationQuery {
    page?: number;               // Página solicitada (por defecto 1)
    limit?: number;              // Elementos por página (por defecto 20)
    sortBy?: string;             // Campo por el que ordenar
    order?: "asc" | "desc";     // Dirección del ordenamiento
}
