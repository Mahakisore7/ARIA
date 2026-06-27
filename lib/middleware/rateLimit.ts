const rateLimiter = new Map<string, { count: number; resetAt: number }>()
export function checkRateLimit(uid: string): boolean {
  const now = Date.now()
  const limit = rateLimiter.get(uid)
  if (!limit || now > limit.resetAt) { rateLimiter.set(uid, { count: 1, resetAt: now + 60_000 }); return true }
  if (limit.count >= 15) return false
  limit.count++
  return true
}
