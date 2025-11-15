'use client';

import { useEffect, useState } from 'react';
import { Settings, Type, Contrast, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { prefersReducedMotion, prefersHighContrast } from '@/lib/utils/accessibility';

interface AccessibilityControlsProps {
  className?: string;
}

export function AccessibilityControls({ className }: AccessibilityControlsProps) {
  const [fontSize, setFontSize] = useState(100); // percentage
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check system preferences
    if (typeof window !== 'undefined') {
      setHighContrast(prefersHighContrast());
      setReducedMotion(prefersReducedMotion());
    }
  }, []);

  useEffect(() => {
    // Apply font size
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${fontSize}%`;
    }
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast
    if (typeof document !== 'undefined') {
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  }, [highContrast]);

  useEffect(() => {
    // Apply reduced motion
    if (typeof document !== 'undefined') {
      if (reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    }
  }, [reducedMotion]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 left-4 z-50',
          'flex h-12 w-12 items-center justify-center',
          'rounded-full bg-blue-600 text-white shadow-lg',
          'hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30',
          'transition-all min-h-[44px] min-w-[44px]',
          className
        )}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
      >
        <Settings className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'fixed bottom-20 left-4 z-50',
            'w-80 rounded-lg border bg-white shadow-xl',
            'p-4 space-y-4',
            'dark:bg-slate-800 dark:border-slate-700'
          )}
          role="dialog"
          aria-labelledby="accessibility-title"
        >
          <h3 id="accessibility-title" className="text-lg font-semibold">
            Accessibility Settings
          </h3>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-slate-600" />
              <label htmlFor="font-size" className="text-sm font-medium">
                Font Size: {fontSize}%
              </label>
            </div>
            <input
              id="font-size"
              type="range"
              min="75"
              max="150"
              step="5"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
              aria-label="Adjust font size"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4 text-slate-600" />
              <label htmlFor="high-contrast" className="text-sm font-medium">
                High Contrast
              </label>
            </div>
            <button
              id="high-contrast"
              onClick={() => setHighContrast(!highContrast)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                highContrast ? 'bg-blue-600' : 'bg-slate-300'
              )}
              aria-pressed={highContrast}
              aria-label="Toggle high contrast mode"
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                  highContrast ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-slate-600" />
              <label htmlFor="reduced-motion" className="text-sm font-medium">
                Reduced Motion
              </label>
            </div>
            <button
              id="reduced-motion"
              onClick={() => setReducedMotion(!reducedMotion)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                reducedMotion ? 'bg-blue-600' : 'bg-slate-300'
              )}
              aria-pressed={reducedMotion}
              aria-label="Toggle reduced motion"
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                  reducedMotion ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

