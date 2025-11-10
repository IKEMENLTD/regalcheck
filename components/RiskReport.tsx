import { AnalysisResult } from '@/lib/types';
import RiskCard from './RiskCard';

interface RiskReportProps {
  result: AnalysisResult;
  onReset: () => void;
}

export default function RiskReport({ result, onReset }: RiskReportProps) {
  const highRisks = result.risks.filter((r) => r.level === 'high');
  const mediumRisks = result.risks.filter((r) => r.level === 'medium');
  const lowRisks = result.risks.filter((r) => r.level === 'low');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 md:space-y-8">
      {/* スコア表示 */}
      <div
        className={`
          ${getScoreBgColor(result.score)} border-2 rounded-xl
          xs:p-4 sm:p-6 md:p-8 text-center
        `}
      >
        <div className="flex items-center justify-center xs:gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
          <div className="bg-blue-100 rounded-lg xs:w-8 xs:h-8 sm:w-10 sm:h-10 flex items-center justify-center">
            <svg className="xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h2 className="xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            分析結果
          </h2>
        </div>
        <div className="flex items-center justify-center xs:gap-2 sm:gap-3 md:gap-4">
          <span className="xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-gray-700">
            リスクスコア:
          </span>
          <span
            className={`
              ${getScoreColor(result.score)}
              xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold
            `}
          >
            {result.score}
          </span>
          <span className="xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-gray-600">
            / 100
          </span>
        </div>
        <p className="xs:text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-3 xs:px-2">
          スコアが低いほどリスクが高くなります
        </p>
      </div>

      {/* 総評 */}
      {result.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg xs:p-3 sm:p-4 md:p-6">
          <h3 className="xs:text-sm sm:text-base md:text-lg font-bold text-blue-900 mb-2 sm:mb-3 flex items-center xs:gap-2 sm:gap-3">
            <div className="bg-blue-100 rounded-lg xs:w-6 xs:h-6 sm:w-7 sm:h-7 flex items-center justify-center flex-shrink-0">
              <svg className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            総評
          </h3>
          <p className="xs:text-xs sm:text-sm md:text-base text-blue-800 leading-relaxed">
            {result.summary}
          </p>
        </div>
      )}

      {/* リスク一覧 */}
      {highRisks.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h3 className="xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 flex items-center xs:gap-2 sm:gap-3">
            <div className="bg-red-100 rounded-lg xs:w-6 xs:h-6 sm:w-7 sm:h-7 flex items-center justify-center flex-shrink-0">
              <svg className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            高リスク ({highRisks.length}件)
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {highRisks.map((risk, index) => (
              <RiskCard key={`high-${index}`} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {mediumRisks.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h3 className="xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 flex items-center xs:gap-2 sm:gap-3">
            <div className="bg-yellow-100 rounded-lg xs:w-6 xs:h-6 sm:w-7 sm:h-7 flex items-center justify-center flex-shrink-0">
              <svg className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            中リスク ({mediumRisks.length}件)
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {mediumRisks.map((risk, index) => (
              <RiskCard key={`medium-${index}`} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {lowRisks.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h3 className="xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 flex items-center xs:gap-2 sm:gap-3">
            <div className="bg-green-100 rounded-lg xs:w-6 xs:h-6 sm:w-7 sm:h-7 flex items-center justify-center flex-shrink-0">
              <svg className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            低リスク ({lowRisks.length}件)
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {lowRisks.map((risk, index) => (
              <RiskCard key={`low-${index}`} risk={risk} />
            ))}
          </div>
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex flex-col xs:gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6">
        <button
          onClick={onReset}
          className="
            w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold
            rounded-lg transition-colors duration-200
            xs:px-4 sm:px-6 md:px-8 xs:py-2.5 sm:py-3 md:py-4
            xs:text-sm sm:text-base md:text-lg
            shadow-md hover:shadow-lg
            flex items-center justify-center gap-2
          "
        >
          <svg className="xs:w-4 xs:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          新しい契約書を分析
        </button>
      </div>

      {/* 免責事項 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg xs:p-3 sm:p-4 md:p-6">
        <h4 className="xs:text-xs sm:text-sm md:text-base font-bold text-gray-800 mb-2 sm:mb-3 flex items-center xs:gap-1 sm:gap-2">
          <div className="bg-gray-200 rounded-lg xs:w-5 xs:h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0">
            <svg className="xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          重要な免責事項
        </h4>
        <div className="space-y-1 sm:space-y-2 xs:text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
          <p>
            本サービスは契約書の一般的なリスクを参考情報として提供するものであり、法的助言や弁護士によるレビューに代わるものではありません。
          </p>
          <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 ml-2 sm:ml-3 xs:text-xs sm:text-xs md:text-sm text-gray-600">
            <li>本サービスの分析結果は完全性を保証しません</li>
            <li>重要な契約については必ず弁護士等の専門家にご相談ください</li>
            <li>本サービスの利用により生じた損害について、一切の責任を負いません</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
