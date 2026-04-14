export async function rateLimitPlaceholder(_key: string) {
  // Integrate with Redis/Upstash in production.
  return { allowed: true, remaining: 100 };
}
