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

// IPアドレスのバリデーション（IPv4/IPv6）
function isValidIpAddress(ip: string): boolean {
  // IPv4パターン: xxx.xxx.xxx.xxx
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6パターン（簡易版）
  const ipv6Pattern = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;
  const ipv6CompressedPattern = /^((?:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*)?)::((?:[A-F0-9]{1,4}(?::[A-F0-9]{1,4})*)?)$/i;

  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip) || ipv6CompressedPattern.test(ip);
}

// リクエストフィンガープリント生成（IP偽装対策）
function generateFingerprint(request: Request): string {
  const components = [
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    request.headers.get('accept-encoding') || '',
    request.headers.get('sec-ch-ua') || '',
    request.headers.get('sec-ch-ua-platform') || '',
  ];

  // シンプルなハッシュ関数（本番環境ではcryptoモジュール推奨）
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return hash.toString(36);
}

// IPアドレスを取得するヘルパー関数（偽装対策強化版）
export function getClientIp(request: Request): string {
  let clientIp = 'unknown';

  // 優先度順にIPアドレスを取得（信頼できる順）
  // 1. Vercel専用ヘッダー（最も信頼性が高い）
  const vercelIp = request.headers.get('x-vercel-forwarded-for') ||
                   request.headers.get('x-real-ip');
  if (vercelIp && isValidIpAddress(vercelIp)) {
    clientIp = vercelIp;
  }

  // 2. Cloudflare（信頼できるCDN）
  else if (request.headers.get('cf-connecting-ip')) {
    const cfIp = request.headers.get('cf-connecting-ip')!;
    if (isValidIpAddress(cfIp)) {
      clientIp = cfIp;
    }
  }

  // 3. x-forwarded-for（最も一般的だが偽装可能）
  else if (request.headers.get('x-forwarded-for')) {
    const forwarded = request.headers.get('x-forwarded-for')!;
    // 最初のIPのみ取得（プロキシチェーンの元IP）
    const firstIp = forwarded.split(',')[0].trim();
    if (isValidIpAddress(firstIp)) {
      clientIp = firstIp;
    }
  }

  // IPが取得できない、または無効な場合はフィンガープリントを使用
  if (clientIp === 'unknown' || !isValidIpAddress(clientIp)) {
    const fingerprint = generateFingerprint(request);
    console.warn(`⚠️ Invalid or missing IP address, using fingerprint: ${fingerprint}`);
    return `fingerprint-${fingerprint}`;
  }

  // プライベートIP範囲の検出（開発環境対策）
  if (clientIp.startsWith('192.168.') ||
      clientIp.startsWith('10.') ||
      clientIp.startsWith('172.16.') ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1') {
    // プライベートIPの場合もフィンガープリントを併用
    const fingerprint = generateFingerprint(request);
    console.log(`🏠 Private IP detected (${clientIp}), adding fingerprint: ${fingerprint}`);
    return `${clientIp}-${fingerprint}`;
  }

  return clientIp;
}
