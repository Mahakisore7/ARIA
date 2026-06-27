export function sanitizeInput(input: string): string {
  return input
    .slice(0, 600)
    .replace(/[<>{}\\]/g, '')
    .replace(/ignore previous instructions/gi, '')
    .replace(/you are now/gi, '')
    .replace(/system prompt/gi, '')
    .replace(/jailbreak/gi, '')
    .trim()
}
