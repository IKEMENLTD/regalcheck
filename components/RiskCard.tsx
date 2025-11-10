import { Risk } from '@/lib/types';

interface RiskCardProps {
  risk: Risk;
}

const levelConfig = {
  high: {
    label: '高リスク',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
  },
  medium: {
    label: '中リスク',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
  },
  low: {
    label: '低リスク',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
  },
};

export default function RiskCard({ risk }: RiskCardProps) {
  const config = levelConfig[risk.level];

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} border rounded-lg
        xs:p-3 sm:p-4 md:p-5 lg:p-6
        transition-all duration-200 hover:shadow-md
      `}
    >
      <div className="flex items-start justify-between xs:gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
        <div className="flex items-center xs:gap-2 sm:gap-3">
          <div className={`flex-shrink-0 ${config.iconBg} rounded-lg xs:w-8 xs:h-8 sm:w-10 sm:h-10 flex items-center justify-center`}>
            <svg className={`${config.iconColor} xs:w-4 xs:h-4 sm:w-5 sm:h-5`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className={`font-bold ${config.textColor} xs:text-sm sm:text-base md:text-lg lg:text-xl`}>
            {risk.title}
          </h3>
        </div>
        <span
          className={`
            ${config.badgeBg} ${config.badgeText}
            xs:px-2 sm:px-3 xs:py-0.5 sm:py-1 rounded-full
            xs:text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0
          `}
        >
          {config.label}
        </span>
      </div>

      {risk.category && (
        <div className="mb-2 sm:mb-3">
          <span className="xs:text-xs sm:text-sm text-gray-600 font-medium">
            カテゴリ: {risk.category}
          </span>
        </div>
      )}

      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <div>
          <h4 className="xs:text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
            問題点
          </h4>
          <p className="xs:text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
            {risk.description}
          </p>
        </div>

        {risk.quote && (
          <div className="bg-white bg-opacity-60 rounded-md xs:p-2 sm:p-3 border border-gray-200">
            <h4 className="xs:text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              該当箇所
            </h4>
            <p className="xs:text-xs sm:text-sm md:text-base text-gray-600 italic leading-relaxed">
              「{risk.quote}」
            </p>
          </div>
        )}

        <div className="bg-white bg-opacity-60 rounded-md xs:p-2 sm:p-3 border border-gray-200">
          <div className="flex items-start xs:gap-2 sm:gap-3">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg xs:w-6 xs:h-6 sm:w-7 sm:h-7 flex items-center justify-center">
              <svg className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="xs:text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                推奨事項
              </h4>
              <p className="xs:text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                {risk.suggestion}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
