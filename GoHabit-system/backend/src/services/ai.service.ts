/**
 * ═══════════════════════════════════════════════════════════════
 * ai.service.ts — Servicio de IA (stub para integración futura)
 * ═══════════════════════════════════════════════════════════════
 *
 * Este servicio está PREPARADO para conectar con un modelo de IA
 * (OpenAI, Google AI, etc.) que reorganice las tareas del usuario
 * de forma inteligente según patrones de productividad.
 *
 * Actualmente usa una heurística simple como placeholder:
 * ordena las tareas por prioridad (HIGH primero) y fecha límite.
 *
 * Para integrar IA real en el futuro:
 *   1. Instalar el SDK: npm install openai
 *   2. Configurar la API key en .env: OPENAI_API_KEY="sk-..."
 *   3. Reemplazar la lógica de reorganizeTasks con una llamada al modelo
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

export const aiService = {
    /**
     * reorganizeTasks — Reorganiza las tareas pendientes del usuario.
     *
     * Versión actual (placeholder):
     *   - Obtiene tareas PENDING e IN_PROGRESS
     *   - Las ordena por prioridad (HIGH > MEDIUM > LOW) y fecha límite
     *   - Devuelve sugerencias genéricas
     *
     * Versión futura (con IA):
     *   - Analizar patrones de productividad del usuario
     *   - Considerar tiempo disponible y energía
     *   - Proponer un orden óptimo con explicaciones
     *
     * @param userId - ID del usuario autenticado
     * @returns { reorganized: Task[], suggestions: string[] }
     */
    async reorganizeTasks(userId: string) {
        const tasks = await prisma.task.findMany({
            where: {
                userId,
                status: { in: ["PENDING", "IN_PROGRESS"] },  // Solo tareas activas
            },
            orderBy: [
                { priority: "desc" },  // HIGH primero, luego MEDIUM, luego LOW
                { dueDate: "asc" },    // Más urgentes primero
            ],
        });

        if (tasks.length === 0) {
            throw new NotFoundError("No pending tasks found");
        }

        // Placeholder: devolver las tareas reordenadas + sugerencias estáticas
        // En producción, aquí se llamaría al modelo de IA
        return {
            reorganized: tasks,
            suggestions: [
                "Focus on HIGH priority tasks first",
                "Consider breaking large tasks into subtasks",
            ],
        };
    },
};
