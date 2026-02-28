/**
 * ═══════════════════════════════════════════════════════════════
 * with-validation.ts — Middleware de validación con Zod
 * ═══════════════════════════════════════════════════════════════
 *
 * ¿Qué hace?
 * Valida el body de la petición HTTP contra un schema Zod ANTES
 * de que llegue al handler. Si los datos son inválidos, devuelve
 * automáticamente un error 400 con los detalles de qué campos fallaron.
 *
 * ¿Qué es Zod?
 * Una librería de validación que define "schemas" (formas esperadas
 * de los datos) y valida objetos contra ellos. Es como un "molde"
 * que verifica que los datos del cliente tienen el formato correcto.
 *
 * Ejemplo sin withValidation (manual, repetitivo):
 *   export async function POST(req) {
 *     const body = await req.json();
 *     if (!body.title) return error("title is required");
 *     if (body.title.length > 100) return error("title too long");
 *     // ... más validaciones manuales
 *   }
 *
 * Ejemplo con withValidation (limpio, declarativo):
 *   export const POST = withValidation(createHabitSchema, async (req, { data }) => {
 *     // `data` ya está validado y tipado correctamente
 *     const habit = await habitService.create(userId, data);
 *     return created(habit);
 *   });
 *
 * Si el body no cumple el schema, devuelve automáticamente:
 *   HTTP 400: {
 *     "error": {
 *       "code": "VALIDATION_ERROR",
 *       "message": "Validation failed",
 *       "details": { "title": ["Título requerido"] }
 *     }
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { error } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";

/**
 * Tipo del handler que recibe withValidation.
 * T es el tipo de datos validados (inferido del schema Zod).
 * El handler recibe `data` en lugar de tener que leer el body manualmente.
 */
type ValidatedHandler<T> = (
    req: NextRequest,
    context: { data: T; params?: Record<string, string> }
) => Promise<NextResponse>;

/**
 * withValidation — Envuelve un handler para validar el body automáticamente.
 *
 * @param schema  - Schema Zod que define la forma esperada del body
 * @param handler - Handler que recibe los datos ya validados y tipados
 * @returns       - Nueva función que valida el body antes de ejecutar
 */
export function withValidation<T>(schema: ZodSchema<T>, handler: ValidatedHandler<T>) {
    return async (req: NextRequest, routeContext: { params: Promise<Record<string, string>> }) => {
        try {
            // 1. Leer el body JSON de la petición
            const body = await req.json();

            // 2. Validar con Zod — si falla, lanza ZodError automáticamente
            //    Si pasa, `data` tiene el tipo correcto inferido del schema
            const data = schema.parse(body);

            // 3. Resolver params dinámicos de la ruta (igual que en withAuth)
            const resolvedParams = await routeContext.params;

            // 4. Ejecutar el handler con los datos validados
            return handler(req, { data, params: resolvedParams });
        } catch (err) {
            // Si Zod detectó errores de validación
            if (err instanceof ZodError) {
                return error(
                    new ValidationError(
                        "Validation failed",
                        err.flatten().fieldErrors  // Detalles por campo: { title: ["..."], email: ["..."] }
                    )
                );
            }
            // Si el body no es JSON válido (SyntaxError)
            if (err instanceof SyntaxError) {
                return error(new ValidationError("Invalid JSON body"));
            }
            // Cualquier otro error inesperado
            return error(err);
        }
    };
}
