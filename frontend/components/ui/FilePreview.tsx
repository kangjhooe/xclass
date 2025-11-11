'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { OptimizedImage } from './OptimizedImage';

export interface FilePreviewProps {
  file: File | string; // File object or URL
  fileName?: string;
  fileType?: string;
  onClose?: () => void;
  className?: string;
  showDownload?: boolean;
  showFullscreen?: boolean;
  maxWidth?: string;
  maxHeight?: string;
}

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/wave'];
const PDF_TYPES = ['application/pdf'];
const TEXT_TYPES = ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json', 'text/csv'];
const OFFICE_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/msword', // .doc
  'application/vnd.ms-excel', // .xls
  'application/vnd.ms-powerpoint', // .ppt
];

export function FilePreview({
  file,
  fileName,
  fileType,
  onClose,
  className,
  showDownload = true,
  showFullscreen = true,
  maxWidth = '100%',
  maxHeight = '600px',
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [detectedType, setDetectedType] = useState<string | null>(fileType || null);

  // Determine file type
  useEffect(() => {
    const detectFileType = async () => {
      if (fileType) {
        setDetectedType(fileType);
        return;
      }

      if (typeof file === 'string') {
        // URL - try to detect from extension
        const extension = file.split('.').pop()?.toLowerCase();
        const typeMap: Record<string, string> = {
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          gif: 'image/gif',
          webp: 'image/webp',
          svg: 'image/svg+xml',
          mp4: 'video/mp4',
          webm: 'video/webm',
          ogg: 'video/ogg',
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          pdf: 'application/pdf',
          txt: 'text/plain',
          html: 'text/html',
          json: 'application/json',
          csv: 'text/csv',
        };
        setDetectedType(typeMap[extension || ''] || 'application/octet-stream');
      } else {
        // File object
        setDetectedType(file.type || 'application/octet-stream');
      }
    };

    detectFileType();
  }, [file, fileType]);

  // Create preview URL
  useEffect(() => {
    const createPreviewUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (typeof file === 'string') {
          // URL
          setPreviewUrl(file);
          setIsLoading(false);
        } else {
          // File object
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        setError('Gagal memuat preview file');
        setIsLoading(false);
      }
    };

    createPreviewUrl();

    return () => {
      if (previewUrl && typeof file !== 'string') {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file]);

  const handleDownload = useCallback(() => {
    if (typeof file === 'string') {
      window.open(file, '_blank');
    } else {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || file.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [file, fileName]);

  const handleFullscreen = useCallback(() => {
    if (!previewUrl) return;

    if (!isFullscreen) {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  }, [previewUrl, isFullscreen]);

  // Exit fullscreen on ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const getFileCategory = (type: string | null): string => {
    if (!type) return 'unknown';
    if (IMAGE_TYPES.includes(type)) return 'image';
    if (VIDEO_TYPES.includes(type)) return 'video';
    if (AUDIO_TYPES.includes(type)) return 'audio';
    if (PDF_TYPES.includes(type)) return 'pdf';
    if (TEXT_TYPES.includes(type)) return 'text';
    if (OFFICE_TYPES.includes(type)) return 'office';
    return 'unknown';
  };

  const category = getFileCategory(detectedType);
  const displayFileName = fileName || (typeof file === 'object' ? file.name : file.split('/').pop() || 'File');

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Skeleton variant="rectangular" height={256} width="100%" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <svg
            className="w-16 h-16 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Preview tidak tersedia</p>
        </div>
      );
    }

    switch (category) {
      case 'image':
        return (
          <OptimizedImage
            src={previewUrl}
            alt={displayFileName}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            objectFit="contain"
            quality={90}
            className="max-w-full max-h-full"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Gagal memuat gambar');
              setIsLoading(false);
            }}
          />
        );

      case 'video':
        return (
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-full"
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setError('Gagal memuat video');
              setIsLoading(false);
            }}
          >
            Browser Anda tidak mendukung video tag.
          </video>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <svg
              className="w-24 h-24 text-blue-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <audio
              src={previewUrl}
              controls
              className="w-full max-w-md"
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setError('Gagal memuat audio');
                setIsLoading(false);
              }}
            >
              Browser Anda tidak mendukung audio tag.
            </audio>
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={previewUrl}
            className="w-full h-full min-h-[600px] border-0"
            title={displayFileName}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Gagal memuat PDF');
              setIsLoading(false);
            }}
          />
        );

      case 'text':
        return (
          <TextFilePreview url={previewUrl} onLoad={() => setIsLoading(false)} />
        );

      case 'office':
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <svg
              className="w-16 h-16 text-blue-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Preview untuk file Office tidak tersedia
            </p>
            <Button onClick={handleDownload} variant="primary">
              Download File
            </Button>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Format file tidak didukung untuk preview
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              {displayFileName}
            </p>
            {showDownload && (
              <Button onClick={handleDownload} variant="primary">
                Download File
              </Button>
            )}
          </div>
        );
    }
  };

  const previewContent = (
    <div
      className={cn(
        'relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden',
        'flex items-center justify-center',
        className
      )}
      style={{ maxWidth, maxHeight }}
    >
      {renderPreview()}

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {showFullscreen && category !== 'unknown' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFullscreen}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </Button>
        )}
        {showDownload && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </Button>
        )}
        {onClose && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
        <div className="relative w-full h-full flex items-center justify-center">
          {renderPreview()}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      </div>
    );
  }

  return previewContent;
}

// Component untuk preview text files
function TextFilePreview({ url, onLoad }: { url: string; onLoad: () => void }) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadText = async () => {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setContent(text);
        setIsLoading(false);
        onLoad();
      } catch (error) {
        setIsLoading(false);
        onLoad();
      }
    };

    loadText();
  }, [url, onLoad]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Skeleton variant="rectangular" height={256} width="100%" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] bg-white dark:bg-gray-800 p-4 overflow-auto">
      <pre className="text-sm font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
        {content}
      </pre>
    </div>
  );
}

/**
 * Modal wrapper untuk FilePreview
 */
export function FilePreviewModal({
  file,
  fileName,
  fileType,
  isOpen,
  onClose,
  ...props
}: FilePreviewProps & { isOpen: boolean }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {fileName || (typeof file === 'object' ? file.name : 'Preview')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <FilePreview file={file} fileName={fileName} fileType={fileType} onClose={onClose} {...props} />
        </div>
      </div>
    </div>
  );
}

