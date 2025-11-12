import { NextRequest, NextResponse } from 'next/server';
import { analyzeContract } from '@/lib/geminiClient';
import { parseFile } from './fileParser';
import { AnalyzeResponse } from '@/lib/types';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Node.js Runtimeを使用（unpdf にはNode.js APIが必要）
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// セキュリティヘッダーのヘルパー関数
function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
  };
}

// 入力サニタイゼーション（XSS対策）
function sanitizeInput(input: string): string {
  // HTMLタグを除去
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

export async function POST(request: NextRequest) {
  const securityHeaders = getSecurityHeaders();

  try {
    console.log('[INFO] API /analyze called');

    // レート制限チェック
    const clientIp = getClientIp(request);
    console.log('[INFO] Client identifier:', clientIp.substring(0, 20) + '...');

    const rateLimitResult = checkRateLimit(clientIp);

    // レート制限ヘッダーを追加
    const headers = {
      ...securityHeaders,
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

    console.log('[INFO] Rate limit check passed. Remaining:', rateLimitResult.remaining);
    const body = await request.json();
    let { fileData, fileName, fileType } = body;

    // 入力サニタイゼーション
    fileName = sanitizeInput(fileName || 'unknown');

    console.log('[INFO] File info:', { fileName, fileType, dataLength: fileData?.length });

    if (!fileData || typeof fileData !== 'string') {
      console.log('[WARN] Invalid file data format');
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: 'ファイルデータが不正です。' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Base64からBufferに変換
    console.log('[INFO] Converting base64 to buffer...');
    const buffer = Buffer.from(fileData, 'base64');
    console.log('[INFO] Buffer created, size:', buffer.length, 'bytes');

    // ファイルを解析してテキストを取得
    let fileContent: string;
    try {
      console.log('[INFO] Parsing file...');
      fileContent = await parseFile(buffer, fileType);
      console.log('[INFO] File parsed successfully, content length:', fileContent.length);
    } catch (parseError) {
      // エラーメッセージを簡略化（内部詳細を隠す）
      console.error('[ERROR] Parse failed:', parseError);
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: 'ファイルの解析に失敗しました。ファイル形式が正しいか確認してください。',
        },
        { status: 400, headers: securityHeaders }
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
    // エラーの詳細はログのみに記録（クライアントには一般的なメッセージ）
    console.error('[ERROR] Analysis failed:', error);
    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: '分析中にエラーが発生しました。しばらくしてから再度お試しください。',
      },
      { status: 500, headers: securityHeaders }
    );
  }
}
