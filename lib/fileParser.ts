// サーバー側専用: Node.js Bufferを使用
export async function parseFile(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    // 動的インポート（サーバー側のみ）
    const pdfParseModule: any = await import('pdf-parse');
    // CommonJS moduleの場合は.defaultを使用
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else if (fileType === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error('サポートされていないファイル形式です。PDF, DOCX, TXTのみ対応しています。');
  }
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'ファイルサイズは10MB以下にしてください。' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'PDF, DOCX, TXTファイルのみ対応しています。' };
  }

  return { valid: true };
}
