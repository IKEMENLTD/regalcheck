import mammoth from 'mammoth';
// CRITICAL: 動的importでpdfjs-distをロード（オブジェクトfreezeを回避）
let pdfjsLib: any = null;

// サーバー側専用: Node.js Bufferを使用
export async function parseFile(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === 'application/pdf') {
    try {
      // 初回のみpdfjs-distを動的ロード
      if (!pdfjsLib) {
        pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        // ESM importの結果がfrozenなので、disableWorkerは設定できない
        // 代わりにworkerSrcを設定せず、getDocumentのオプションでworker無効化
      }

      console.log('🔍 Starting PDF parsing with pdfjs-dist (worker disabled via options)...');
      console.log('📦 Buffer size:', buffer.length, 'bytes');

      // PDF.js用の設定（サーバーレス環境用: worker完全無効化）
      // workerSrcを設定しないことで、worker読み込みをスキップ
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        useWorkerFetch: false,
        isEvalSupported: false,
        disableAutoFetch: true,
        disableStream: true,
        standardFontDataUrl: undefined,
        cMapUrl: undefined,
        verbosity: 0,
      });

      const pdf = await loadingTask.promise;
      console.log('✅ PDF loaded successfully');
      console.log('📄 Number of pages:', pdf.numPages);

      let fullText = '';

      // 各ページのテキストを抽出
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('PDFからテキストを抽出できませんでした。スキャンされた画像PDFの可能性があります。');
      }

      console.log('✅ PDF text extracted, length:', fullText.length);
      return fullText;
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
