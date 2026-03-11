import { query, execute } from "@/lib/mysql";

export const adminRepository = {
    async findUsers(limit: number, offset: number): Promise<any[]> {
        const [rows]: any = await query(
            'SELECT id, email, username, firstName, lastName, role, points, level, createdAt FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows || [];
    },

    async countUsers(): Promise<number> {
        const [rows]: any = await query('SELECT COUNT(*) as total FROM users');
        return rows[0].total;
    },

    async updateUserRole(userId: string, role: string): Promise<void> {
        await execute('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    },

    async getSystemStats(): Promise<any> {
        const queries = [
            query('SELECT COUNT(*) as count FROM users'),
            query('SELECT COUNT(*) as count FROM habits'),
            query('SELECT COUNT(*) as count FROM tasks'),
            query('SELECT COUNT(*) as count FROM habit_completions'),
        ];

        const [users, habits, tasks, completions]: any = await Promise.all(queries);

        return {
            totalUsers: users[0][0].count,
            totalHabits: habits[0][0].count,
            totalTasks: tasks[0][0].count,
            totalCompletions: completions[0][0].count,
        };
    },

    async createReward(data: any): Promise<number> {
        const [result]: any = await execute(
            'INSERT INTO rewards (name, description, cost, icon) VALUES (?, ?, ?, ?)',
            [data.name, data.description || null, data.cost, data.icon || null]
        );
        return result.insertId;
    },

    async updateReward(id: string, data: any): Promise<void> {
        const ALLOWED_COLUMNS = new Set([
            'name', 'description', 'cost', 'icon', 'isActive',
        ]);

        const allowed = Object.keys(data).filter(key => ALLOWED_COLUMNS.has(key));
        if (allowed.length === 0) return;

        const setClause = allowed.map(key => `${key} = ?`).join(', ');
        const values    = allowed.map(key => data[key]);

        await execute(
            `UPDATE rewards SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
    },

    async deleteReward(id: string): Promise<void> {
        await execute('DELETE FROM rewards WHERE id = ?', [id]);
    },

    async findRewardById(id: string): Promise<any | null> {
        const [rows]: any = await query('SELECT * FROM rewards WHERE id = ?', [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async findUserById(id: string): Promise<any | null> {
        const [rows]: any = await query('SELECT id, email, username, role FROM users WHERE id = ?', [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    }
};
