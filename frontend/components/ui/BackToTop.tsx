'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BackToTopProps {
  threshold?: number;
  className?: string;
  smooth?: boolean;
}

export function BackToTop({
  threshold = 400,
  className,
  smooth = true,
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className={cn(
        'fixed bottom-8 right-8 z-50',
        'flex h-12 w-12 items-center justify-center',
        'rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500',
        'text-white shadow-lg shadow-blue-500/50',
        'transition-all duration-300',
        'hover:scale-110 hover:shadow-blue-500/70',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/30',
        'animate-float-slow',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

