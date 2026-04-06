/**
 * ═══════════════════════════════════════════════════════════════
 * AI Conversation History Implementation Guide
 * ═══════════════════════════════════════════════════════════════
 * 
 * This document describes the changes needed to implement conversation
 * history tracking and provide context-aware AI recommendations.
 */

// ═══════════════════════════════════════════════════════════════
// STEP 1: Database Setup
// ═══════════════════════════════════════════════════════════════

// Run this SQL migration:
// File: GoHabit-system/mysql/init-db/migration-ai-conversations.sql

/*
CREATE TABLE IF NOT EXISTS ai_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    userMessage TEXT NOT NULL,
    aiResponse LONGTEXT NOT NULL,
    provider ENUM('gemini', 'heuristic') NOT NULL DEFAULT 'heuristic',
    contextUsed TINYINT(1) NOT NULL DEFAULT 0,
    suggestionsCount INT NOT NULL DEFAULT 0,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_ai_conversations_userId (userId),
    INDEX idx_ai_conversations_createdAt (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
*/

// ═══════════════════════════════════════════════════════════════
// STEP 2: Update ai.repository.ts
// ═══════════════════════════════════════════════════════════════

// Add these methods to aiRepository:

/*
    async saveConversation(userId: string, userMessage: string, aiResponse: any): Promise<void> {
        const responseStr = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);
        const provider = aiResponse?.provider || 'heuristic';
        const contextUsed = aiResponse?.contextUsed ? 1 : 0;
        const suggestionsCount = aiResponse?.suggestions?.length || 0;

        await query(
            `INSERT INTO ai_conversations (userId, userMessage, aiResponse, provider, contextUsed, suggestionsCount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, userMessage, responseStr, provider, contextUsed, suggestionsCount]
        );
    },

    async getRecentConversations(userId: string, limit: number = 5): Promise<any[]> {
        const [conversations]: any = await query(
            `SELECT userMessage, aiResponse, provider, createdAt
             FROM ai_conversations
             WHERE userId = ?
             ORDER BY createdAt DESC
             LIMIT ?`,
            [userId, limit]
        );
        return conversations?.reverse() || []; // Return in chronological order
    },

    async getUserConversationStats(userId: string): Promise<any> {
        const [stats]: any = await query(
            `SELECT 
                COUNT(*) as totalConversations,
                SUM(CASE WHEN provider = 'gemini' THEN 1 ELSE 0 END) as geminiConversations,
                SUM(CASE WHEN contextUsed = 1 THEN 1 ELSE 0 END) as contextAwareConversations,
                AVG(suggestionsCount) as avgSuggestionsPerConversation,
                MAX(createdAt) as lastConversation
             FROM ai_conversations
             WHERE userId = ?`,
            [userId]
        );
        return stats?.[0] || {};
    }
*/

// ═══════════════════════════════════════════════════════════════
// STEP 3: Update ai.service.ts
// ═══════════════════════════════════════════════════════════════

// Modify recommendHabits method to:
// 1. Get recent conversation history
// 2. Include it in the Gemini prompt
// 3. Save the conversation after response

/*
import { aiRepository } from "@/repositories/ai.repository";

async function geminiRecommendations(userId: string, message: string) {
    const key = env.GOOGLE_API_KEY;
    if (!key) {
        console.warn("[AI] GOOGLE_API_KEY no configurada");
        return heuristicRecommendations(message);
    }

    try {
        // Get user context and recent conversations
        const userContext = await aiRepository.getUserHabitPatterns(userId);
        const recentConversations = await aiRepository.getRecentConversations(userId, 3);
        
        const currentHabits = userContext.habits?.map((h: any) => `- ${h.title}`).join("\n") || "None";
        const conversationHistory = recentConversations
            .map((c: any) => `User: ${c.userMessage}\nAssistant: ${c.aiResponse}`)
            .join("\n---\n");

        // Updated prompt with conversation history
        const systemContext = [
            "You are an intelligent habit coach AI.",
            "",
            "User's Current Habits:",
            currentHabits,
            "",
            conversationHistory ? `Previous Conversations:\n${conversationHistory}` : "",
            "",
            "User's Current Message:",
            message,
            // ... rest of prompt
        ].join("\n");

        // Make API call
        const response = await fetch(endpoint, { ... });
        
        // ... process response
        
        // IMPORTANT: Save the conversation
        await aiRepository.saveConversation(userId, message, result);
        
        return result;
    } catch (err) {
        console.warn("[AI] Gemini recommendations failed:", err);
        return heuristicRecommendations(message);
    }
}
*/

// ═══════════════════════════════════════════════════════════════
// STEP 4: Conversation Context Injection
// ═══════════════════════════════════════════════════════════════

// The key idea: Use conversation history to:
// 1. Prevent duplicate recommendations
// 2. Build on previous suggestions
// 3. Learn user preferences over time
// 4. Provide more personalized suggestions

// Example flow:
// User: "I want to sleep better"
// AI: "I recommend meditation, better sleep schedule, and limiting screen time"
// ---
// User: "I already meditate daily, what else?"
// AI: "Since you already meditate, let me suggest complementary habits:
//      dark bedroom environment, avoid caffeine after 2pm, etc."

// ═══════════════════════════════════════════════════════════════
// STEP 5: Analytics & Learning
// ═══════════════════════════════════════════════════════════════

// Track which suggestions users actually adopt using stats:
// - geminiConversations: How often AI provides personalized recommendations
// - contextAwareConversations: How often recommendations use conversation history
// - avgSuggestionsPerConversation: User engagement level

// This enables:
// 1. Better recommendation weighting over time
// 2. Identifying which habits stick best
// 3. Optimizing for each user's preferences

// ═══════════════════════════════════════════════════════════════
// Benefits of This Implementation
// ═══════════════════════════════════════════════════════════════

// ✅ Context Awareness: AI remembers previous conversations
// ✅ Smart Learning: Avoids repeated suggestions
// ✅ User Patterns: Identifies what works for each user
// ✅ Continuous Improvement: Gets better with each interaction
// ✅ No Generic Responses: Every recommendation is personalized
// ✅ Conversation Flow: Feels like talking to a real coach

export {};
