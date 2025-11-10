import { NextRequest, NextResponse } from 'next/server';
import { analyzeContract } from '@/lib/geminiClient';
import { parseFile } from './fileParser';
import { AnalyzeResponse } from '@/lib/types';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 API /analyze called');

    // レート制限チェック
    const clientIp = getClientIp(request);
    console.log('🔒 Client IP:', clientIp);

    const rateLimitResult = checkRateLimit(clientIp);

    // レート制限ヘッダーを追加
    const headers = {
      'X-RateLimit-Limit': rateLimitResult.limit.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
    };

    if (!rateLimitResult.success) {
      console.log('❌ Rate limit exceeded for IP:', clientIp);
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: `1日の利用上限（${rateLimitResult.limit}回）に達しました。${new Date(rateLimitResult.reset).toLocaleString('ja-JP')}以降に再度お試しください。`,
        },
        { status: 429, headers }
      );
    }

    console.log('✅ Rate limit check passed. Remaining:', rateLimitResult.remaining);
    const body = await request.json();
    const { fileData, fileName, fileType } = body;

    console.log('📄 File info:', { fileName, fileType, dataLength: fileData?.length });

    if (!fileData || typeof fileData !== 'string') {
      console.error('❌ Invalid file data');
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'ファイルデータが不正です。' },
        { status: 400 }
      );
    }

    // Base64からBufferに変換
    console.log('🔄 Converting base64 to buffer...');
    const buffer = Buffer.from(fileData, 'base64');
    console.log('✅ Buffer created, size:', buffer.length, 'bytes');

    // ファイルを解析してテキストを取得
    let fileContent: string;
    try {
      console.log('📖 Parsing file...');
      fileContent = await parseFile(buffer, fileType);
      console.log('✅ File parsed, content length:', fileContent.length, 'characters');
    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
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

    return NextResponse.json<AnalyzeResponse>(
      {
        success: true,
        data: result,
      },
      { headers }
    );
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
