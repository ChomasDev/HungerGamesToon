/** Whether a file should be treated as a roster portrait image. */
export function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(file.name)
}

/** Display name from an image filename (basename without extension). */
export function titleFromImageFilename(filename: string): string {
  const base = filename.replace(/[/\\]/g, '').replace(/\.[^.]+$/i, '').trim()
  return base || 'Giocatore'
}
