/**
 * API Types and Interfaces
 */

import { NextRequest } from "next/server";

export interface AuthenticatedUser {
    id: string;
    role: string;
}

export interface AuthenticatedRequest extends NextRequest {
    user: AuthenticatedUser;
}

export interface RouteParams<T extends Record<string, string> = Record<string, string>> {
    params: Promise<T>;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
}
