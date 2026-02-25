/**
 * ═══════════════════════════════════════════════════════════════
 * errors.ts — Clases de error personalizadas de la aplicación
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Para qué sirve?
 * Define errores específicos del negocio con códigos HTTP asociados.
 * Así, cuando algo falla en un servicio, podemos lanzar un error
 * con la información correcta y el middleware lo convierte automáticamente
 * en una respuesta HTTP con el status code y mensaje adecuados.
 *
 * Ejemplo de uso:
 *   throw new NotFoundError("Habit");
 *   // → Respuesta HTTP 404: { error: { code: "NOT_FOUND", message: "Habit not found" } }
 *
 * Jerarquía:
 *   Error (nativo de JavaScript)
 *     └── AppError (error base de nuestra app, con statusCode y code)
 *           ├── NotFoundError (404)
 *           ├── UnauthorizedError (401)
 *           ├── ForbiddenError (403)
 *           ├── ValidationError (400)
 *           └── ConflictError (409)
 */

/**
 * AppError — Clase base para todos los errores de la aplicación.
 * Extiende el Error nativo de JavaScript añadiendo:
 *   - statusCode: código HTTP (404, 401, 500, etc.)
 *   - code: código de error legible (NOT_FOUND, UNAUTHORIZED, etc.)
 */
export class AppError extends Error {
    public readonly statusCode: number;  // Código HTTP a devolver
    public readonly code: string;        // Código de error para el frontend

    constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
        super(message);           // Llama al constructor de Error con el mensaje
        this.name = "AppError";   // Nombre de la clase (útil para debugging)
        this.statusCode = statusCode;
        this.code = code;
    }
}

/**
 * NotFoundError — El recurso solicitado no existe (HTTP 404).
 * Ejemplo: buscar un hábito con un ID que no está en la BD.
 */
export class NotFoundError extends AppError {
    constructor(resource: string = "Resource") {
        super(`${resource} not found`, 404, "NOT_FOUND");
        this.name = "NotFoundError";
    }
}

/**
 * UnauthorizedError — No autenticado (HTTP 401).
 * Ejemplo: intentar acceder a una ruta protegida sin token JWT.
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401, "UNAUTHORIZED");
        this.name = "UnauthorizedError";
    }
}

/**
 * ForbiddenError — Autenticado pero sin permisos (HTTP 403).
 * Ejemplo: un usuario normal intentando acceder a /api/admin/*.
 */
export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, 403, "FORBIDDEN");
        this.name = "ForbiddenError";
    }
}

/**
 * ValidationError — Datos de entrada inválidos (HTTP 400).
 * Ejemplo: enviar un email sin "@" o una contraseña muy corta.
 * Incluye un campo `details` con los errores específicos de cada campo.
 */
export class ValidationError extends AppError {
    public readonly details: unknown;  // Detalles de los campos que fallaron

    constructor(message: string = "Validation failed", details?: unknown) {
        super(message, 400, "VALIDATION_ERROR");
        this.name = "ValidationError";
        this.details = details;
    }
}

/**
 * ConflictError — El recurso ya existe (HTTP 409).
 * Ejemplo: intentar registrarse con un email que ya está en uso.
 */
export class ConflictError extends AppError {
    constructor(message: string = "Resource already exists") {
        super(message, 409, "CONFLICT");
        this.name = "ConflictError";
    }
}
