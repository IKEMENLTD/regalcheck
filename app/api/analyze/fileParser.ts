import mammoth from 'mammoth';
import { extractText, getDocumentProxy } from 'unpdf';

// ファイルタイプのマジックナンバー（ファイル先頭バイト）による検証
function validateFileType(buffer: Buffer, declaredType: string): { valid: boolean; actualType: string | null } {
  // 最初の10バイトを確認（マジックナンバー検証）
  const header = buffer.slice(0, 10);

  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46) {
    const actualType = 'application/pdf';
    return { valid: declaredType === actualType, actualType };
  }

  // DOCX: PK (0x50 0x4B) - ZIP形式
  // DOCXはZIPアーカイブなので、さらに詳細チェック
  if (header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04) {
    // ZIPの中身を軽く確認（DOCXは[Content_Types].xmlを含む）
    const bufferStr = buffer.toString('utf-8', 0, Math.min(buffer.length, 1000));
    if (bufferStr.includes('[Content_Types].xml') || bufferStr.includes('word/')) {
      const actualType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      return { valid: declaredType === actualType, actualType };
    }
    // ZIPだけどDOCXではない
    return { valid: false, actualType: 'application/zip' };
  }

  // TXT: プレーンテキスト（UTF-8 BOM確認、またはASCII範囲）
  if (declaredType === 'text/plain') {
    // UTF-8 BOM: 0xEF 0xBB 0xBF
    if (header[0] === 0xEF && header[1] === 0xBB && header[2] === 0xBF) {
      return { valid: true, actualType: 'text/plain' };
    }
    // ASCIIまたは一般的なテキスト範囲（0x09-0x0D, 0x20-0x7E）
    let isPlainText = true;
    for (let i = 0; i < Math.min(100, buffer.length); i++) {
      const byte = buffer[i];
      if (!(byte === 0x09 || byte === 0x0A || byte === 0x0D || (byte >= 0x20 && byte <= 0x7E) || byte >= 0x80)) {
        isPlainText = false;
        break;
      }
    }
    if (isPlainText) {
      return { valid: true, actualType: 'text/plain' };
    }
  }

  // マジックナンバーが一致しない
  return { valid: false, actualType: null };
}

// ファイルサイズ制限（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// サーバー側専用: Node.js Bufferを使用
export async function parseFile(buffer: Buffer, fileType: string): Promise<string> {
  // 1. ファイルサイズチェック
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`ファイルサイズが大きすぎます（最大10MB）。現在のサイズ: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
  }

  if (buffer.length === 0) {
    throw new Error('ファイルが空です。');
  }

  // 2. マジックナンバー検証（ファイル内容とMIMEタイプの一致確認）
  const validation = validateFileType(buffer, fileType);
  if (!validation.valid) {
    console.error('❌ File type mismatch:', {
      declared: fileType,
      actual: validation.actualType,
      bufferSize: buffer.length,
      firstBytes: buffer.slice(0, 10).toString('hex'),
    });
    throw new Error(
      `ファイル形式が一致しません。宣言: ${fileType}, 実際: ${validation.actualType || '不明'}。` +
      `セキュリティ上の理由により、正しいファイル形式をアップロードしてください。`
    );
  }

  console.log('✅ File validation passed:', { fileType, size: buffer.length });
  if (fileType === 'application/pdf') {
    try {
      console.log('🔍 Starting PDF parsing with unpdf (serverless-optimized)...');
      console.log('📦 Buffer size:', buffer.length, 'bytes');

      // unpdf: サーバーレス環境専用のPDF.js再配布版を使用
      // worker不要、Vercel/Lambda/Cloudflare Workers対応
      // Buffer → Uint8Array変換が必要
      const uint8Array = new Uint8Array(buffer);
      const { text } = await extractText(uint8Array, { mergePages: true });

      if (!text || text.trim().length === 0) {
        throw new Error('PDFからテキストを抽出できませんでした。スキャンされた画像PDFの可能性があります。');
      }

      console.log('✅ PDF text extracted, length:', text.length);
      return text;
    } catch (error) {
      console.error('❌ PDF parsing error:', error);
      throw new Error(`PDFの解析エラー: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      console.log('📄 Parsing DOCX file...');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`DOCXの解析エラー: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (fileType === 'text/plain') {
    return buffer.toString('utf-8');
  } else {
    throw new Error(`サポートされていないファイル形式: ${fileType}`);
  }
}
