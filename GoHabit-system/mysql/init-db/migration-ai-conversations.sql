-- ═══════════════════════════════════════════════════════════════
-- Migration: Add AI Conversation History Table
-- ═══════════════════════════════════════════════════════════════
-- This migration adds support for storing AI conversation history
-- to enable context-aware recommendations and user learning.

USE goto;

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
)
COMMENT 'Stores AI chat history for context-aware recommendations and user behavior learning';
