/**
 * Reward and Progress Entity Types
 */

import { UserPublicProfile } from "./user.entity";

export interface Reward {
    id: string;
    name: string;
    description: string | null;
    cost: number;
    icon: string | null;
    isActive: boolean;
    createdAt: Date;
}

export interface RewardCreateInput {
    name: string;
    description?: string;
    cost: number;
    icon?: string;
}

export interface UserProgress {
    points: number;
    coins: number;
    level: number;
    habitsCompleted: number;
    tasksCompleted: number;
    currentStreak: number;
}

export interface FriendComparison {
    user: UserPublicProfile;
    friend: UserPublicProfile;
    userProgress: UserProgress;
    friendProgress: UserProgress;
}
