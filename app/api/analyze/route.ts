import { NextRequest, NextResponse } from 'next/server';
import { analyzeContract } from '@/lib/claudeClient';
import { parseFile } from '@/lib/fileParser';
import { AnalyzeResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileData, fileName, fileType } = body;

    if (!fileData || typeof fileData !== 'string') {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'ファイルデータが不正です。' },
        { status: 400 }
      );
    }

    // Base64からBufferに変換
    const buffer = Buffer.from(fileData, 'base64');

    // ファイルを解析してテキストを取得
    let fileContent: string;
    try {
      fileContent = await parseFile(buffer, fileType);
    } catch (parseError) {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: parseError instanceof Error ? parseError.message : 'ファイルの解析に失敗しました。',
        },
        { status: 400 }
      );
    }

    if (fileContent.length < 100) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: '契約書の内容が短すぎます。最低100文字以上必要です。' },
        { status: 400 }
      );
    }

    if (fileContent.length > 50000) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: '契約書の内容が長すぎます。50,000文字以内にしてください。' },
        { status: 400 }
      );
    }

    const result = await analyzeContract(fileContent);

    return NextResponse.json<AnalyzeResponse>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '分析中にエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}
