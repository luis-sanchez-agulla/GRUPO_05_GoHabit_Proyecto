/**
 * Task Entity Types
 */

export interface Task {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    dueDate: Date | null;
    scheduledAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface TaskCreateInput {
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
    scheduledAt?: string;
}

export interface TaskUpdateInput extends Partial<TaskCreateInput> {
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}
