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
        const keys = Object.keys(data);
        if (keys.length === 0) return;

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

        await execute(
            `UPDATE tasks SET ${setClause} WHERE id = ? AND userId = ?`,
            [...values, id, userId]
        );
    },

    async delete(id: string, userId: string): Promise<void> {
        await execute('DELETE FROM tasks WHERE id = ? AND userId = ?', [id, userId]);
    },

    async updateWithConnection(id: string, data: any, connection: any): Promise<void> {
        const keys = Object.keys(data);
        if (keys.length === 0) return;

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);

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
