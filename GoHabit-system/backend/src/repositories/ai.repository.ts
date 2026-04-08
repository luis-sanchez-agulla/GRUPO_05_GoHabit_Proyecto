import { query } from "@/lib/mysql";

export const aiRepository = {
    async findTasksForReorganization(userId: string): Promise<any[]> {
        const [tasks]: any = await query(
            `SELECT id, title, description, priority, dueDate, status, estimatedTime, createdAt
             FROM tasks 
             WHERE userId = ? AND status IN ('PENDING', 'IN_PROGRESS')
             ORDER BY dueDate ASC`,
            [userId]
        );
        return tasks || [];
    },

    async getUserHabitPatterns(userId: string): Promise<any> {
        // Obtener hábitos activos del usuario
        const [habits]: any = await query(
            `SELECT h.id, h.title, h.frequency, h.targetCount, 
                    COUNT(hc.id) as completionCount,
                    DATE(hc.completedAt) as lastCompleted
             FROM habits h
             LEFT JOIN habit_completions hc ON h.id = hc.habitId
             WHERE h.userId = ?
             GROUP BY h.id
             LIMIT 10`,
            [userId]
        );

        // Obtener estadísticas de tareas completadas
        const [taskStats]: any = await query(
            `SELECT 
                COUNT(*) as totalTasks,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedTasks,
                AVG(CASE WHEN status = 'COMPLETED' THEN DATEDIFF(completedAt, createdAt) ELSE NULL END) as avgCompletionDays
             FROM tasks
             WHERE userId = ?`,
            [userId]
        );

        return {
            habits: habits || [],
            stats: taskStats?.[0] || {},
        };
    },

    async getUserProductivityTimezone(userId: string): Promise<any> {
        // Analizar patrones de completación para identificar horas productivas
        const [completionTimes]: any = await query(
            `SELECT 
                HOUR(hc.completedAt) as hour,
                COUNT(*) as count
             FROM habit_completions hc
             JOIN habits h ON hc.habitId = h.id
             WHERE h.userId = ?
             GROUP BY HOUR(hc.completedAt)
             ORDER BY count DESC
             LIMIT 5`,
            [userId]
        );

        return completionTimes || [];
    }
};
