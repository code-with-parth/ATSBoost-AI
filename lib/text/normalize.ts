export function normalizeText(input: string, opts?: { maxChars?: number }) {
  const maxChars = opts?.maxChars ?? 30000

  const normalized = input
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (normalized.length <= maxChars) return normalized
  return normalized.slice(0, maxChars).trim()
}

export function estimateTokens(text: string) {
  // Rough approximation: ~4 characters per token in English
  return Math.ceil(text.length / 4)
}
