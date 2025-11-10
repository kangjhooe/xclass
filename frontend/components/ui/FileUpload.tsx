'use client';

import { useState, useRef, DragEvent } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void> | void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept,
  multiple = false,
  maxSize = 10,
  maxFiles = 5,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File ${file.name} terlalu besar. Maksimal ${maxSize}MB`;
    }
    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type;
      
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        return fileType.match(type.replace('*', '.*'));
      });

      if (!isAccepted) {
        return `File ${file.name} tidak didukung. Format yang diterima: ${accept}`;
      }
    }
    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);

    const fileArray = Array.from(files);

    if (!multiple && fileArray.length > 1) {
      setError('Hanya boleh upload 1 file');
      return;
    }

    if (fileArray.length > maxFiles) {
      setError(`Maksimal ${maxFiles} file`);
      return;
    }

    // Validate all files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    try {
      setIsUploading(true);
      await onUpload(fileArray);
    } catch (err: any) {
      setError(err.message || 'Gagal mengupload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isUploading
                ? 'Mengupload...'
                : isDragging
                ? 'Lepaskan file di sini'
                : 'Drag & drop file di sini atau klik untuk memilih'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maksimal {maxSize}MB per file
              {multiple && `, maksimal ${maxFiles} file`}
            </p>
            {accept && (
              <p className="text-xs text-gray-500 mt-1">
                Format: {accept}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            Pilih File
          </Button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

