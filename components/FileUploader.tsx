'use client';

import { useCallback, useState } from 'react';
import { validateFile } from '@/lib/fileValidator';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validation = validateFile(file);

      if (!validation.valid) {
        setError(validation.error || 'ファイルが無効です。');
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl
          transition-all duration-300 ease-in-out
          ${
            isDragging
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-[1.02] shadow-xl'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-lg'
          }
          xs:p-8 sm:p-12 md:p-16 lg:p-20
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInput}
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center cursor-pointer relative"
        >
          {/* アイコン */}
          <div className={`
            xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28
            mb-4 sm:mb-6 md:mb-8
            bg-slate-600
            rounded-2xl
            flex items-center justify-center
            shadow-lg
            transform transition-transform duration-300
            ${isDragging ? 'scale-110' : 'hover:scale-105'}
          `}>
            <svg
              className="xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* テキスト */}
          <div className="text-center space-y-2 sm:space-y-3">
            <p className="xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-2 xs:px-4">
              {isDragging ? 'ここにドロップ' : 'ファイルをドロップまたはクリック'}
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap xs:px-4">
              <span className="inline-flex items-center gap-1 xs:text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                PDF
              </span>
              <span className="inline-flex items-center gap-1 xs:text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                DOCX
              </span>
              <span className="inline-flex items-center gap-1 xs:text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                TXT
              </span>
            </div>
            <p className="xs:text-xs sm:text-sm text-gray-500 xs:px-4">
              最大50MB
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-red-50 border border-red-200 rounded-xl shadow-md animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="xs:text-xs sm:text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
