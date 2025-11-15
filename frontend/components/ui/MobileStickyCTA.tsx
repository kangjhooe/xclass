'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MobileStickyCTAProps {
  href?: string;
  label?: string;
  className?: string;
  showOnScroll?: boolean;
}

export function MobileStickyCTA({
  href = '/register',
  label = 'Daftar',
  className,
  showOnScroll = true,
}: MobileStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(!showOnScroll);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!showOnScroll || !isMobile) {
      setIsVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolled down, hide when at top
      setIsVisible(currentScrollY > 100 && currentScrollY > lastScrollY);
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showOnScroll, isMobile]);

  if (!isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white border-t border-slate-200 shadow-lg',
        'px-4 py-3',
        'transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full',
        'md:hidden',
        className
      )}
    >
      <Link
        href={href}
        className={cn(
          'flex items-center justify-center gap-2',
          'w-full rounded-xl',
          'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500',
          'px-6 py-3 text-base font-semibold text-white',
          'shadow-lg shadow-blue-500/30',
          'transition hover:shadow-blue-500/50 hover:scale-[1.02]',
          'min-h-[44px]', // Touch-friendly
          'focus:outline-none focus:ring-4 focus:ring-blue-500/30'
        )}
      >
        <span>{label}</span>
        <Sparkles className="h-4 w-4" />
      </Link>
    </div>
  );
}

