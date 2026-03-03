import { query } from "@/lib/mysql";

export const aiRepository = {
    async findTasksForReorganization(userId: string): Promise<any[]> {
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
        return tasks || [];
    }
};
