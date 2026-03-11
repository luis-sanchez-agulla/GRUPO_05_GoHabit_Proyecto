import { query, execute } from "@/lib/mysql";
import { Task } from "@/entities/task.entity";

export const taskRepository = {
    async findById(id: string): Promise<Task | null> {
        const [rows]: any = await query('SELECT * FROM tasks WHERE id = ?', [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findAllByUserId(userId: string): Promise<Task[]> {
        const [rows]: any = await query(
            'SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );
        return rows || [];
    },

    async create(userId: string, data: any): Promise<number> {
        const [result]: any = await execute(
            'INSERT INTO tasks (userId, title, description, priority, dueDate, scheduledAt) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, data.title, data.description || null, data.priority || 'MEDIUM', data.dueDate || null, data.scheduledAt || null]
        );
        return result.insertId;
    },

    async update(id: string, userId: string, data: any): Promise<void> {

        const ALLOWED_COLUMNS = new Set([
            'title', 'description', 'priority', 'status',
            'dueDate', 'scheduledAt', 'completedAt',
        ]);

        const allowed = Object.keys(data).filter(key => ALLOWED_COLUMNS.has(key));
        if (allowed.length === 0) return;

        const setClause = allowed.map(key => `${key} = ?`).join(', ');
        const values    = allowed.map(key => data[key]);

        await execute(
            `UPDATE tasks SET ${setClause} WHERE id = ? AND userId = ?`,
            [...values, id, userId]
        );
    },

    async delete(id: string, userId: string): Promise<void> {
        await execute('DELETE FROM tasks WHERE id = ? AND userId = ?', [id, userId]);
    },

    async updateWithConnection(id: string, data: any, connection: any): Promise<void> {
        
        const ALLOWED_COLUMNS = new Set([
            'title', 'description', 'priority', 'status',
            'dueDate', 'scheduledAt', 'completedAt',
        ]);

        const allowed = Object.keys(data).filter(key => ALLOWED_COLUMNS.has(key));
        if (allowed.length === 0) return;

        const setClause = allowed.map(key => `${key} = ?`).join(', ');
        const values    = allowed.map(key => data[key]);

        await connection.execute(
            `UPDATE tasks SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
    },

    async updateUserStats(userId: string, points: number, coins: number, connection: any): Promise<void> {
        await connection.execute(
            "UPDATE users SET points = points + ?, coins = coins + ? WHERE id = ?",
            [points, coins, userId]
        );
    },

    async countTasksCompleted(userId: string): Promise<number> {
        const [rows]: any = await query(
            "SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND status = ?",
            [userId, "COMPLETED"]
        );
        return rows[0].count;
    },

    async findByDateRange(userId: string, from: Date, to: Date): Promise<Task[]> {
        const [rows]: any = await query(
            `SELECT * FROM tasks WHERE userId = ? AND 
            (dueDate BETWEEN ? AND ? OR scheduledAt BETWEEN ? AND ?)
            ORDER BY dueDate ASC`,
            [userId, from, to, from, to]
        );
        return rows || [];
    }
};
