'use client';

import { useState, useEffect, useRef } from 'react';

// 規約バージョン - 規約を更新したら必ずこのバージョンを上げる
const TERMS_VERSION = '1.0.0';
const TERMS_VERSION_KEY = 'terms-version';
const TERMS_AGREED_KEY = 'terms-agreed';
const TERMS_TIMESTAMP_KEY = 'terms-timestamp';

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ローカルストレージで同意状態を確認
    const agreedVersion = localStorage.getItem(TERMS_VERSION_KEY);
    const hasAgreed = localStorage.getItem(TERMS_AGREED_KEY);

    // バージョンが異なる場合、または同意していない場合はモーダルを表示
    if (agreedVersion !== TERMS_VERSION || hasAgreed !== 'true') {
      setIsOpen(true);
    }
  }, []);

  // Escキーでモーダルを閉じる（拒否として扱う）
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDecline();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // フォーカストラップ（アクセシビリティ）
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  const handleAgree = () => {
    if (!isAgreed) {
      alert('免責事項と利用規約に同意するには、チェックボックスをオンにしてください。');
      return;
    }

    // 同意情報を保存（バージョン、同意フラグ、タイムスタンプ）
    const timestamp = new Date().toISOString();
    localStorage.setItem(TERMS_VERSION_KEY, TERMS_VERSION);
    localStorage.setItem(TERMS_AGREED_KEY, 'true');
    localStorage.setItem(TERMS_TIMESTAMP_KEY, timestamp);

    console.log(`Terms accepted: version ${TERMS_VERSION}, timestamp: ${timestamp}`);
    setIsOpen(false);
  };

  const handleDecline = () => {
    // 同意を拒否した場合の処理
    alert('本サービスのご利用には、免責事項と利用規約への同意が必要です。');
    // ページを離れるか、アプリを閉じることを推奨
    window.history.back();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      onClick={(e) => {
        // 背景クリックで閉じない（意図的な同意が必要）
        e.stopPropagation();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          {/* ヘッダー */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 id="disclaimer-title" className="text-2xl sm:text-3xl font-bold text-gray-900">
              重要な免責事項と利用規約
            </h2>
          </div>

          {/* バージョン表示 */}
          <div className="mb-4 text-xs text-gray-500">
            規約バージョン: {TERMS_VERSION} | 最終更新: 2025年1月
          </div>

          {/* 免責事項内容 */}
          <div className="space-y-6 text-sm sm:text-base text-gray-700 mb-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6">
              <h3 className="font-bold text-red-900 text-lg mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                本サービスは法的助言ではありません
              </h3>
              <p className="leading-relaxed">
                本サービスは、AIによる契約書の一般的なリスク分析を提供するものであり、<span className="font-bold text-red-700">法律相談、法的助言、または弁護士の見解を提供するものではありません。</span>本サービスの利用により、弁護士・依頼者間の関係は一切成立しません。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">1. 専門家への相談義務</h3>
              <p className="leading-relaxed">
                本サービスの分析結果は参考情報に過ぎません。<span className="font-bold">重要な契約の締結前には、必ず弁護士、司法書士、その他の適切な専門家に相談してください。</span>本サービスの利用は、専門家への相談を代替するものではありません。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">2. 分析結果の正確性について</h3>
              <p className="leading-relaxed">
                本サービスはAI技術を使用しており、分析結果の完全性、正確性、妥当性、有用性について一切保証しません。AIによる分析には誤りや見落としが含まれる可能性があります。<span className="font-bold">分析結果に基づく判断・行動は、すべて利用者自身の責任において行ってください。</span>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">3. 損害賠償責任の制限</h3>
              <p className="leading-relaxed">
                本サービスの利用、または利用できないことにより生じた一切の損害（直接損害、間接損害、逸失利益、機会損失、データ損失、事業中断など）について、当方は一切の責任を負いません。これには、本サービスの分析結果の誤り、不正確さ、見落としに起因する損害も含まれます。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">4. 利用者の自己責任</h3>
              <p className="leading-relaxed">
                本サービスは「現状有姿」で提供されます。利用者は、本サービスの分析結果を利用する際、自己の責任において、専門家の意見を求め、独自の判断を行うものとします。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">5. データの取り扱い</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>アップロードされたファイルは分析完了後、サーバー側で即座に削除されます（保持期間: 最大60秒）</li>
                <li>個人情報、契約内容は一切保存されません</li>
                <li>分析履歴は記録されません</li>
                <li>IPアドレスは利用制限の目的でのみ一時的に記録されます（24時間後に自動削除）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">6. 利用制限</h3>
              <p className="leading-relaxed">
                本サービスは1つのIPアドレスあたり1日5回までご利用いただけます。過度な利用や不正な利用が検出された場合、事前の通知なくアクセスを制限する場合があります。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">7. サービスの提供継続について</h3>
              <p className="leading-relaxed">
                当方は、予告なくサービスの内容変更、停止、終了を行う権利を留保します。これにより生じた損害について、一切の責任を負いません。
              </p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 sm:p-6">
              <h3 className="font-bold text-amber-900 mb-2">8. 準拠法と管轄裁判所</h3>
              <p className="leading-relaxed text-amber-900">
                本規約は日本法に準拠し、本サービスに関する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </div>
          </div>

          {/* 同意チェックボックスとボタン */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer" htmlFor="agree-checkbox">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                aria-describedby="agreement-text"
              />
              <span id="agreement-text" className="text-sm text-gray-700">
                上記の免責事項および利用規約（バージョン {TERMS_VERSION}）を読み、理解し、同意します。本サービスは法的助言ではなく、重要な契約については必ず専門家に相談することを理解しました。
              </span>
            </label>

            <div className="flex gap-4">
              <button
                onClick={handleDecline}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-xl transition-colors text-lg border-2 border-gray-300"
                aria-label="利用規約に同意せず、サービスを利用しない"
              >
                同意しない
              </button>
              <button
                onClick={handleAgree}
                disabled={!isAgreed}
                className={`flex-1 font-bold py-4 px-6 rounded-xl transition-colors text-lg ${
                  isAgreed
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                aria-label="利用規約に同意して、サービスを利用する"
                aria-disabled={!isAgreed}
              >
                同意して利用を開始
              </button>
            </div>

            <p className="text-xs text-center text-gray-500">
              規約に同意しない場合、本サービスをご利用いただけません
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
