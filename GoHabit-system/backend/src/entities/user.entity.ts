/**
 * User Entity Types
 */

export interface UserPublicProfile {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    level: number;
    points: number;
}


export interface UserPrivateProfile extends UserPublicProfile {
    email: string;
    role: string;
    coins: number;
    createdAt: Date;
}

export interface TreeStage {
    stage: number;    // Current stage of the tree
}