/**
 * Habit Entity Types
 */

export interface Habit {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    targetCount: number;
    currentCount: number;
    color: string;
    icon: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface HabitCreateInput {
    title: string;
    description?: string;
    frequency?: "DAILY" | "WEEKLY" | "MONTHLY";
    targetCount?: number;
    color?: string;
    icon?: string;
}

export interface HabitUpdateInput extends Partial<HabitCreateInput> {
    isActive?: boolean;
}
