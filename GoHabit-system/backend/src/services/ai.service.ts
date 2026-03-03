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

import { query } from "@/lib/mysql";
import { NotFoundError } from "@/lib/errors";

export const aiService = {
    /**
     * reorganizeTasks — Reorganiza las tareas pendientes del usuario.
     *
     * Versión actual (placeholder):
     *   - Obtiene tareas PENDING e IN_PROGRESS
     *   - Las ordena por prioridad (HIGH > MEDIUM > LOW) y fecha límite
     *   - Devuelve sugerencias genéricas
     */
    async reorganizeTasks(userId: string) {
        const [tasks]: any = await query(
            `SELECT * FROM tasks 
             WHERE userId = ? AND status IN ('PENDING', 'IN_PROGRESS')
             ORDER BY 
                CASE priority 
                    WHEN 'HIGH' THEN 1 
                    WHEN 'MEDIUM' THEN 2 
                    WHEN 'LOW' THEN 3 
                    ELSE 4 
                END ASC,
                dueDate ASC`,
            [userId]
        );

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
