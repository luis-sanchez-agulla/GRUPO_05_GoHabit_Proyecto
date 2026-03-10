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

import { aiRepository } from "@/repositories/ai.repository";
import { NotFoundError } from "@/lib/errors";

export const aiService = {
    /**
     * reorganizeTasks — Reorganiza las tareas pendientes del usuario.
     */
    async reorganizeTasks(userId: string) {
        const tasks = await aiRepository.findTasksForReorganization(userId);

        if (!tasks || tasks.length === 0) {
            throw new NotFoundError("No pending tasks found");
        }

        // Placeholder: devolver las tareas reordenadas + sugerencias estáticas
        return {
            reorganized: tasks,
            suggestions: [
                "Focus on HIGH priority tasks first",
                "Consider breaking large tasks into subtasks",
            ],
        };
    },
};
