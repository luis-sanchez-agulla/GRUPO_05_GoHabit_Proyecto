/**
 * ═══════════════════════════════════════════════════════════════
 * api-response.ts — Helpers para estandarizar respuestas JSON
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Para qué sirve?
 * Garantiza que TODAS las respuestas de la API sigan el mismo formato:
 *
 *   Éxito:  { data: {...}, meta?: {...} }
 *   Error:  { error: { code: "...", message: "...", details?: {...} } }
 *
 * Esto facilita que el frontend siempre sepa cómo parsear
 * la respuesta sin importar qué endpoint llame.
 *
 * Uso en route handlers:
 *   return success(data);         // 200 con datos
 *   return created(data);         // 201 recurso creado
 *   return noContent();           // 204 sin contenido
 *   return error(err);            // Código según tipo de error
 */

import { NextResponse } from "next/server";  // Clase de Next.js para crear respuestas HTTP
import { AppError } from "./errors";          // Nuestras clases de error personalizadas

/** Tipo de una respuesta exitosa: { data: T, meta?: {...} } */
interface ApiSuccessResponse<T> {
    data: T;
    meta?: Record<string, unknown>;  // Metadatos opcionales (paginación, etc.)
}

/** Tipo de una respuesta de error: { error: { code, message, details? } } */
interface ApiErrorResponse {
    error: {
        code: string;       // Código de error (NOT_FOUND, VALIDATION_ERROR, etc.)
        message: string;    // Mensaje legible para el usuario/desarrollador
        details?: unknown;  // Detalles adicionales (ej: campos que fallaron validación)
    };
}

/**
 * success — Devuelve una respuesta exitosa (HTTP 200 por defecto).
 *
 * @param data   - Los datos a devolver al cliente
 * @param status - Código HTTP (200 por defecto)
 * @param meta   - Metadatos opcionales (ej: paginación { page, total, totalPages })
 *
 * Ejemplo: return success({ id: "abc", name: "Ejercicio" });
 * → HTTP 200: { "data": { "id": "abc", "name": "Ejercicio" } }
 */
export function success<T>(data: T, status: number = 200, meta?: Record<string, unknown>) {
    const body: ApiSuccessResponse<T> = { data };
    if (meta) body.meta = meta;  // Solo incluimos meta si se proporciona
    return NextResponse.json(body, { status });
}

/**
 * created — Atajo para respuestas de creación exitosa (HTTP 201).
 * Usado cuando se crea un nuevo recurso (POST /api/habits).
 */
export function created<T>(data: T) {
    return success(data, 201);
}

/**
 * noContent — Respuesta vacía (HTTP 204).
 * Usado cuando se elimina un recurso (DELETE /api/habits/[id]).
 * No envía body, solo el status code.
 */
export function noContent() {
    return new NextResponse(null, { status: 204 });
}

/**
 * error — Convierte un error en una respuesta HTTP adecuada.
 *
 * Si es un AppError (nuestro), usa su statusCode y code.
 * Si es un error inesperado (no controlado), devuelve 500.
 *
 * En desarrollo muestra el mensaje real del error.
 * En producción oculta los detalles internos por seguridad.
 *
 * @param err - Error capturado (puede ser AppError, Error nativo, o cualquier cosa)
 */
export function error(err: unknown) {
    // Si es un error que NOSOTROS lanzamos (AppError o sus subclases)
    if (err instanceof AppError) {
        const body: ApiErrorResponse = {
            error: {
                code: err.code,
                message: err.message,
                // Si el error tiene detalles (ej: ValidationError), los incluimos
                ...("details" in err ? { details: (err as { details: unknown }).details } : {}),
            },
        };
        return NextResponse.json(body, { status: err.statusCode });
    }

    // Si es un error INESPERADO (bug, error de la BD, etc.)
    console.error("[API Error]", err);  // Lo mostramos en los logs del servidor
    const body: ApiErrorResponse = {
        error: {
            code: "INTERNAL_ERROR",
            // En desarrollo mostramos el mensaje real para facilitar depuración
            // En producción ocultamos detalles internos por seguridad
            message: process.env.NODE_ENV === "development"
                ? (err as Error).message
                : "Internal server error",
        },
    };
    return NextResponse.json(body, { status: 500 });
}
