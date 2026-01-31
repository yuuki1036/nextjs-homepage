type RateLimitRecord = {
  count: number;
  lastReset: number;
};

type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
};

const rateLimitMaps: Record<string, Map<string, RateLimitRecord>> = {};

function getRateLimitMap(prefix: string): Map<string, RateLimitRecord> {
  if (!rateLimitMaps[prefix]) {
    rateLimitMaps[prefix] = new Map();
  }
  return rateLimitMaps[prefix];
}

export function checkRateLimit(
  identifier: string,
  prefix: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const map = getRateLimitMap(prefix);
  const record = map.get(identifier);

  if (!record || now - record.lastReset > config.windowMs) {
    map.set(identifier, { count: 1, lastReset: now });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      reset: record.lastReset + config.windowMs
    };
  }

  record.count++;
  return {
    success: true,
    remaining: config.maxRequests - record.count,
    reset: record.lastReset + config.windowMs
  };
}

export const sendMailRateLimit = { windowMs: 60 * 1000, maxRequests: 3 };
export const recaptchaRateLimit = { windowMs: 60 * 1000, maxRequests: 10 };

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0];
    return firstIp ? firstIp.trim() : "127.0.0.1";
  }
  return "127.0.0.1";
}
