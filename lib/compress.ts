export const compressToWebP = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;
  try {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return file;
    ctx2d.drawImage(imageBitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
  } catch {
    return file;
  }
};
