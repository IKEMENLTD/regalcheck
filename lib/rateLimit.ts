// IPベースのレート制限（5回/日）
interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

// メモリベースのストア（本番環境ではRedisなどを推奨）
const rateLimitStore: RateLimitStore = {};

// 古いエントリを削除するクリーンアップ関数
function cleanupOldEntries() {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((ip) => {
    if (rateLimitStore[ip].resetTime < now) {
      delete rateLimitStore[ip];
    }
  });
}

// 1時間ごとにクリーンアップ
setInterval(cleanupOldEntries, 60 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const limit = 5; // 1日あたり5回
  const windowMs = 24 * 60 * 60 * 1000; // 24時間

  // IPアドレスのエントリを取得または作成
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  const entry = rateLimitStore[ip];

  // リセット時間を過ぎていたら新しいウィンドウを開始
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }

  // レート制限チェック
  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // カウントを増やす
  entry.count++;

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

// IPアドレスを取得するヘルパー関数
export function getClientIp(request: Request): string {
  // Netlify/Vercel などのプロキシ経由の場合
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Real IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // フォールバック
  return 'unknown';
}
