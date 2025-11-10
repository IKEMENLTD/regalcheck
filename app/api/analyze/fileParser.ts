// サーバー側専用: Node.js Bufferを使用
// pdf-parseを使用（純粋なNode.jsライブラリ）

export async function parseFile(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    try {
      console.log('🔍 Starting PDF parsing with pdf-parse...');
      console.log('📦 Buffer size:', buffer.length, 'bytes');

      // pdf-parseを動的にインポート（サーバーサイドでのみ実行）
      // IMPORTANT: 正しいインポート構文
      const pdfParse = await import('pdf-parse');
      const { PDFParse } = pdfParse;

      console.log('📦 Creating PDFParse instance...');

      // PDFParseインスタンスを作成
      const parser = new PDFParse({ data: buffer });

      console.log('📦 Extracting text from PDF...');

      // getTextメソッドでテキストを抽出
      const result = await parser.getText();

      console.log('📄 PDF loaded successfully');
      console.log('  📊 Pages:', result.total);
      console.log('  📝 Text length:', result.text.length, 'characters');

      const fullText = result.text;

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('PDFからテキストを抽出できませんでした。画像のみのPDFの可能性があります。');
      }

      console.log('✅ PDF parsed successfully, total text length:', fullText.length);

      // クリーンアップ
      await parser.destroy();

      return fullText.trim();
    } catch (error) {
      console.error('❌ PDF parsing error:', error);
      if (error instanceof Error) {
        throw new Error(`PDFの解析エラー: ${error.message}`);
      }
      throw new Error('PDFファイルの解析に失敗しました。ファイルが破損している可能性があります。');
    }
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    console.log('📄 Parsing DOCX/DOC file...');
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    console.log('✅ DOCX parsed, text length:', result.value.length);
    return result.value;
  } else if (fileType === 'text/plain') {
    console.log('📄 Parsing TXT file...');
    const text = buffer.toString('utf-8');
    console.log('✅ TXT parsed, text length:', text.length);
    return text;
  } else {
    throw new Error('サポートされていないファイル形式です。PDF, DOCX, TXTのみ対応しています。');
  }
}
