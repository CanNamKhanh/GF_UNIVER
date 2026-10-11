const MAX_SIDE = 1200;
const JPEG_QUALITY = 0.82;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

/**
 * Reads an image file, downsizes it (longest side <= 1200px) and re-encodes it as JPEG.
 * Keeps each photo around 100–300 KB so ~15–25 photos fit in localStorage (~5 MB).
 */
export async function fileToResizedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Tệp đã chọn không phải là ảnh.');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('Ảnh quá lớn (tối đa 15 MB).');
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('Không đọc được ảnh này. Hãy thử định dạng JPG, PNG hoặc WebP.');
  }

  try {
    const ratio = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.');

    // JPEG has no alpha: paint a dark base so transparent PNGs don't turn harsh black/white
    context.fillStyle = '#0b0620';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
