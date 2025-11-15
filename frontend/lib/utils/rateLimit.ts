/**
 * Client-side rate limiting feedback
 */

interface RateLimitState {
  attempts: number;
  resetTime: number;
  blocked: boolean;
}

const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Check if action is rate limited
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  if (!state || now > state.resetTime) {
    // Reset or create new state
    rateLimitStore.set(key, {
      attempts: 0,
      resetTime: now + windowMs,
      blocked: false,
    });
    return {
      allowed: true,
      remaining: maxAttempts,
      resetIn: windowMs,
    };
  }

  if (state.blocked) {
    const resetIn = Math.max(0, state.resetTime - now);
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  if (state.attempts >= maxAttempts) {
    state.blocked = true;
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.max(0, state.resetTime - now),
    };
  }

  state.attempts += 1;
  const remaining = Math.max(0, maxAttempts - state.attempts);
  const resetIn = Math.max(0, state.resetTime - now);

  return {
    allowed: true,
    remaining,
    resetIn,
  };
}

/**
 * Record an attempt
 */
export function recordAttempt(key: string): void {
  const state = rateLimitStore.get(key);
  if (state) {
    state.attempts += 1;
  }
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get rate limit message
 */
export function getRateLimitMessage(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): string | null {
  const { allowed, remaining, resetIn } = checkRateLimit(key, maxAttempts, windowMs);

  if (!allowed) {
    const minutes = Math.ceil(resetIn / 60000);
    return `Terlalu banyak percobaan. Silakan coba lagi dalam ${minutes} menit.`;
  }

  if (remaining <= 2) {
    return `Peringatan: ${remaining} percobaan tersisa.`;
  }

  return null;
}

