export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_SIZE_MB = 8;

export interface FileValidationResult {
  ok: boolean;
  reason?: 'type' | 'size';
}

export function validateImageFile(file: File): FileValidationResult {
  if (!file.type.startsWith('image/')) {
    return { ok: false, reason: 'type' };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, reason: 'size' };
  }
  return { ok: true };
}
