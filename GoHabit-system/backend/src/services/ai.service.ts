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

type HabitSuggestion = {
    title: string;
    reason: string;
    frequency: string;
};

type HabitTemplate = HabitSuggestion & { tags: string[] };

const HABIT_LIBRARY: HabitTemplate[] = [
    {
        title: "Beber 2L de agua",
        reason: "Mejora la energia diaria y la concentracion.",
        frequency: "Diario",
        tags: ["salud", "agua", "hidratacion", "cansado"],
    },
    {
        title: "Caminar 30 minutos",
        reason: "Reduce el estres y ayuda a mantenerte activo.",
        frequency: "5 dias por semana",
        tags: ["salud", "ejercicio", "estres", "sedentario"],
    },
    {
        title: "Leer 15 paginas",
        reason: "Fortalece el enfoque y el aprendizaje continuo.",
        frequency: "Diario",
        tags: ["lectura", "estudio", "aprender", "mente"],
    },
    {
        title: "Dormir 7-8 horas",
        reason: "Mejora el rendimiento mental y la recuperacion.",
        frequency: "Diario",
        tags: ["sueno", "descanso", "fatiga", "rutina"],
    },
    {
        title: "Planificar el dia 10 minutos",
        reason: "Ayuda a priorizar y cumplir tareas importantes.",
        frequency: "Diario",
        tags: ["productividad", "organizacion", "tareas", "trabajo"],
    },
    {
        title: "Meditar 10 minutos",
        reason: "Aumenta la atencion y regula la ansiedad.",
        frequency: "Diario",
        tags: ["meditacion", "ansiedad", "estres", "bienestar"],
    },
    {
        title: "Preparar comida casera",
        reason: "Te ayuda a comer mejor y ahorrar dinero.",
        frequency: "3-4 veces por semana",
        tags: ["comida", "nutricion", "salud", "ahorro"],
    },
    {
        title: "Estudiar ingles 20 minutos",
        reason: "Mantiene constancia y progreso medible.",
        frequency: "Diario",
        tags: ["idiomas", "ingles", "estudio", "objetivos"],
    },
];

export const aiService = {
    async recommendHabits(_userId: string, message: string) {
        const normalized = message.toLowerCase();
        const scored = HABIT_LIBRARY.map((habit) => {
            const score = habit.tags.reduce((acc, tag) => {
                return normalized.includes(tag) ? acc + 1 : acc;
            }, 0);
            return { habit, score };
        });

        scored.sort((a, b) => b.score - a.score);

        const top = scored
            .filter((item) => item.score > 0)
            .slice(0, 4)
            .map((item) => ({
                title: item.habit.title,
                reason: item.habit.reason,
                frequency: item.habit.frequency,
            }));

        if (top.length > 0) {
            return {
                input: message,
                suggestions: top,
            };
        }

        // Fallback si no hay coincidencias por palabras clave.
        return {
            input: message,
            suggestions: HABIT_LIBRARY.slice(0, 4).map((habit) => ({
                title: habit.title,
                reason: habit.reason,
                frequency: habit.frequency,
            })),
        };
    },

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
