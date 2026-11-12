export const TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_MB = 5

// Validates type/size, then downsizes to keep demo storage small.
export function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!TYPES.includes(file.type)) return reject(new Error('Use a JPG, PNG or WebP image.'))
    if (file.size > MAX_MB * 1048576) return reject(new Error(`Each image must be under ${MAX_MB} MB.`))
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const s = Math.min(1, 800 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = img.width * s
      c.height = img.height * s
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => reject(new Error('That file could not be read as an image.'))
    img.src = url
  })
}
