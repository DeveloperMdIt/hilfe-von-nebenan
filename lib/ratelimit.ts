type RateLimitStore = Map<string, { count: number; expiresAt: number }>;

const rateLimits: RateLimitStore = new Map();

/**
 * Checks if a key (e.g. IP address) has exceeded the rate limit.
 * @param key Unique identifier (IP, UserId, etc.)
 * @param limit Max requests allowed
 * @param windowSeconds Time window in seconds
 * @returns true if allowed, false if blocked
 */
export function checkRateLimit(key: string, limit: number, windowSeconds: number): boolean {
    const now = Date.now();
    const cleanKey = key || 'unknown';

    const record = rateLimits.get(cleanKey);

    if (!record) {
        rateLimits.set(cleanKey, { count: 1, expiresAt: now + windowSeconds * 1000 });
        return true;
    }

    if (now > record.expiresAt) {
        // Window expired, reset
        rateLimits.set(cleanKey, { count: 1, expiresAt: now + windowSeconds * 1000 });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    return true;
}

/**
 * Cleanup old entries to prevent memory leaks (could be run periodically)
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimits.entries()) {
        if (now > record.expiresAt) {
            rateLimits.delete(key);
        }
    }
}, 60 * 1000); // Run every minute
