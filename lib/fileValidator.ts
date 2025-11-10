// クライアント側で使用可能なファイルバリデーション

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'ファイルサイズは50MB以下にしてください。' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'PDF, DOCX, TXTファイルのみ対応しています。' };
  }

  return { valid: true };
}
