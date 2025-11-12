import mammoth from 'mammoth';
import { extractText, getDocumentProxy } from 'unpdf';

// サーバー側専用: Node.js Bufferを使用
export async function parseFile(buffer: Buffer, fileType: string): Promise<string> {
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
