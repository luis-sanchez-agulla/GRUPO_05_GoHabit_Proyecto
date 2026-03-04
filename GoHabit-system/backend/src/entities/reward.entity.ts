/**
 * Reward and Progress Entity Types
 */

export interface Reward {
    id: string;
    name: string;
    type: string;
    rarity: string;
    icon: string | null;
    isActive: boolean;
}

export interface RewardCreateInput {
    name: string;
    type: string;
    rarity: string;
    icon?: string;
}


