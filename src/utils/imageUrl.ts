/** Substrings that almost never point to a raw image suitable for `<img src>`. */
const BLOCKED_URL_MARKERS = [
  'figma.com',
  'figma.',
  'notion.',
  'docs.google',
  'drive.google.com',
  'youtube.com',
  'youtu.be',
  'twitter.com',
  'x.com/',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'SEE_ALL_LINK',
  '/embed',
  'widget',
]

/** Heuristics for pasted page links or junk strings saved as “image” URLs. */
export function shouldLoadPortraitImage(raw: string): boolean {
  const u = raw.trim()
  if (!u) return false
  if (u.startsWith('data:image/')) return true
  if (u.startsWith('blob:')) return true

  if (/^<\s*[a-z!]/i.test(u) || /<\/?[a-z][\s>]/i.test(u)) return false
  if (/\btitle\b\s*[=:]/i.test(u) && u.length < 500) return false

  const lower = u.toLowerCase()
  if (BLOCKED_URL_MARKERS.some((m) => lower.includes(m))) return false

  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    try {
      new URL(u)
    } catch {
      return false
    }
  }

  return true
}
