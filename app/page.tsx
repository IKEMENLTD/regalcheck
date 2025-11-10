'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import RiskReport from '@/components/RiskReport';
import DisclaimerModal from '@/components/DisclaimerModal';
import { AnalysisResult } from '@/lib/types';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
// Note: Edge Runtimeはpdf-parseと互換性がないため、Node.js Runtimeを使用

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // ファイルをBase64に変換（ブラウザネイティブAPI使用）
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);

      // APIに送信
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64,
          fileName: file.name,
          fileType: file.type
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '分析に失敗しました。');
      }

      setResult(data.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : '分析中にエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <>
      <DisclaimerModal />
      <div className="min-h-screen bg-gray-50">
        {/* 背景装飾 - より控えめに */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative xs:px-4 sm:px-6 md:px-8 lg:px-12 xs:py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-8 sm:mb-10 md:mb-14 lg:mb-16 animate-fade-in">
            <h1 className="xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-3 sm:mb-4 tracking-tight">
              契約書リスクチェッカー
            </h1>
            <p className="xs:text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              AI搭載の高精度分析で、契約書に潜むリスクを瞬時に発見
            </p>
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>無料</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>約10秒で分析</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>データ保存なし</span>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          {!result && !isAnalyzing && (
            <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
              <FileUploader onFileSelect={handleFileSelect} />

              {error && (
                <div className="bg-white border-2 border-red-100 rounded-2xl xs:p-4 sm:p-5 md:p-6 shadow-lg animate-fade-in">
                  <div className="flex items-start xs:gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="xs:text-sm sm:text-base md:text-lg font-bold text-red-900 mb-1 sm:mb-2">
                        エラーが発生しました
                      </h3>
                      <p className="xs:text-xs sm:text-sm md:text-base text-red-700 leading-relaxed">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 使い方セクション */}
              <div className="bg-white border border-gray-200 rounded-xl xs:p-6 sm:p-8 md:p-10 shadow-md">
                <h2 className="xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8 flex items-center xs:gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  使い方
                </h2>
                <ol className="space-y-4 sm:space-y-5 md:space-y-6">
                  <li className="flex items-start xs:gap-3 sm:gap-4 md:gap-5">
                    <span className="flex-shrink-0 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-600 text-white rounded-lg flex items-center justify-center xs:text-sm sm:text-base md:text-lg font-bold">
                      1
                    </span>
                    <div className="flex-1 pt-1">
                      <p className="xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-1">
                        契約書ファイルをアップロード
                      </p>
                      <p className="xs:text-xs sm:text-sm text-gray-600">
                        PDF、DOCX、TXT形式に対応（最大50MB）
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start xs:gap-3 sm:gap-4 md:gap-5">
                    <span className="flex-shrink-0 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-600 text-white rounded-lg flex items-center justify-center xs:text-sm sm:text-base md:text-lg font-bold">
                      2
                    </span>
                    <div className="flex-1 pt-1">
                      <p className="xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-1">
                        AIが自動分析
                      </p>
                      <p className="xs:text-xs sm:text-sm text-gray-600">
                        約10秒で10項目のリスクを検出
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start xs:gap-3 sm:gap-4 md:gap-5">
                    <span className="flex-shrink-0 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-600 text-white rounded-lg flex items-center justify-center xs:text-sm sm:text-base md:text-lg font-bold">
                      3
                    </span>
                    <div className="flex-1 pt-1">
                      <p className="xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-1">
                        リスクと改善案を確認
                      </p>
                      <p className="xs:text-xs sm:text-sm text-gray-600">
                        高/中/低のレベル別に分類表示
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* 免責事項 */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl xs:p-6 sm:p-8 md:p-10 shadow-lg">
                <div className="flex items-start xs:gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-amber-900">
                    重要な免責事項
                  </h2>
                </div>
                <div className="space-y-3 sm:space-y-4 xs:text-xs sm:text-sm md:text-base text-amber-900 leading-relaxed">
                  <p className="font-medium">
                    本サービスは参考情報であり、法的助言ではありません。重要な契約は必ず専門家に相談してください。
                  </p>
                  <ul className="space-y-2 sm:space-y-3 ml-4 sm:ml-6">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>ファイルは分析後即座に削除</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>個人情報は一切収集・保存しません</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>分析結果の完全性は保証されません</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ローディング */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center xs:py-16 sm:py-20 md:py-24 lg:py-28 animate-fade-in">
              <div className="relative">
                {/* 外側のリング */}
                <div className="xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-gray-200 absolute inset-0"></div>
                {/* 回転するグラデーションリング */}
                <div className="xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
                {/* 中央のアイコン */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-center space-y-3 sm:space-y-4 mt-8 sm:mt-10">
                <h2 className="xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI分析中
                </h2>
                <p className="xs:text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto px-4">
                  契約書のリスクを高精度で検出しています
                </p>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          )}

          {/* 結果表示 */}
          {result && <RiskReport result={result} onReset={handleReset} />}
        </div>
      </div>

      {/* フッター */}
      <footer className="relative bg-gradient-to-br from-gray-50 to-white border-t border-gray-100 mt-16 sm:mt-20 md:mt-24 lg:mt-28">
        <div className="max-w-5xl mx-auto xs:px-4 sm:px-6 md:px-8 lg:px-12 xs:py-8 sm:py-10 md:py-12">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-bold text-gray-800">契約書リスクチェッカー</span>
            </div>
            <p className="xs:text-xs sm:text-sm text-gray-500">
              © 2025 Contract Risk Checker - Powered by{' '}
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Claude AI
              </span>
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
