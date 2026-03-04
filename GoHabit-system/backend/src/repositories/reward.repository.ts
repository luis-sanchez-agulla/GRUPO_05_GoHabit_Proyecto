import { query, execute } from "@/lib/mysql";
import { Reward } from "@/entities/reward.entity";

export const rewardRepository = {
    async findAllActiveByRarity(rarity: string): Promise<Reward[]> {
        const [rows]: any = await query('SELECT * FROM rewards WHERE isActive = 1 AND rarity = ? ORDER BY cost ASC', [rarity]);
        return rows || [];
    },

    async findAllActive(): Promise<Reward[]> {
        const [rows]: any = await query('SELECT * FROM rewards WHERE isActive = 1 ORDER BY cost ASC');
        return rows || [];
    },

    async findById(id: string): Promise<Reward | null> {
        const [rows]: any = await query('SELECT * FROM rewards WHERE id = ?', [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    },

    async createRedemption(userId: string, rewardId: string, connection: any): Promise<void> {
        await connection.execute(
            'INSERT INTO user_rewards (userId, rewardId) VALUES (?, ?)',
            [userId, rewardId]
        );
    },

    async getLootBoxCostByRarity(rarity: string): Promise<number> {
        const [rows]: any = await query('SELECT coste FROM LootBox WHERE rareza = ?', [rarity]);
        return rows && rows.length > 0 ? rows[0].coste : 0;
    },

    async ownAccessorys(userId: string, accessoryId: string): Promise<boolean> {
        const [rows]: any = await query(
            'SELECT * FROM Avatar_Accesorio WHERE userId = ? AND accesorioId = ?',
            [userId, accessoryId]
        );
        return rows && rows.length > 0;
    }

};
