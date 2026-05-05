/**
 * ═══════════════════════════════════════════════════════════════
 * __tests__/sql-injection.test.ts
 * ═══════════════════════════════════════════════════════════════
 *
 * Unit tests for validation against SQL injection-style payloads.
 */

import { loginSchema, registerSchema } from '../validations/auth.schema';
import { updateProfileSchema } from '../validations/user.schema';
import { updateTaskSchema } from '../validations/task.schema';
import { updateHabitSchema } from '../validations/habit.schema';

describe('SQL Injection Prevention', () => {
    const SQL_INJECTION_PAYLOADS = [
        "' OR '1'='1",
        "admin' --",
        "1' OR 1=1 --",
        "'; DROP TABLE users; --",
        "1' UNION SELECT * FROM users --",
        "' OR 'a'='a",
        "1; DELETE FROM users WHERE 1=1; --",
    ];

    test('loginSchema rejects malicious emails and normalizes case', () => {
        for (const payload of SQL_INJECTION_PAYLOADS) {
            const result = loginSchema.safeParse({ email: payload, password: 'test123' });
            expect(result.success).toBe(false);
        }

        const normalized = loginSchema.parse({ email: 'USER@EXAMPLE.COM', password: 'test123' });
        expect(normalized.email).toBe('user@example.com');
    });

    test('registerSchema rejects extra fields and malicious payloads', () => {
        const malicious = registerSchema.safeParse({
            email: "admin' --",
            username: 'testuser',
            password: 'SecurePass123!',
            role: 'ADMIN',
        });
        expect(malicious.success).toBe(false);

        const extraFields = registerSchema.safeParse({
            email: 'test@example.com',
            username: 'testuser',
            password: 'SecurePass123!',
            isAdmin: true,
        });
        expect(extraFields.success).toBe(false);
    });

    test('updateProfileSchema strips injected keys and validates usernames', () => {
        const parsed = updateProfileSchema.parse({
            firstName: 'Luis',
            'role = "ADMIN"': 'x',
            'password = "hacked"': 'x',
        } as Record<string, unknown>);

        expect(parsed).toEqual({ firstName: 'Luis' });

        const invalidUsername = updateProfileSchema.safeParse({
            username: "bad'; DROP TABLE users; --",
        });
        expect(invalidUsername.success).toBe(false);
    });

    test('updateTaskSchema and updateHabitSchema strip injected keys', () => {
        const taskResult = updateTaskSchema.parse({
            title: 'New Title',
            userId: 'hacker-id',
            '1=1; DELETE FROM tasks WHERE 1=1; --': 'x',
        } as Record<string, unknown>);
        expect(taskResult).toMatchObject({
            title: 'New Title',
            priority: 'MEDIUM',
        });

        const habitResult = updateHabitSchema.parse({
            title: 'Updated Habit',
            'isActive = false': 'x',
            'createdAt = NOW()': 'x',
        } as Record<string, unknown>);
        expect(habitResult).toMatchObject({
            title: 'Updated Habit',
            frequency: 'DAILY',
            targetCount: 1,
        });
    });
});
