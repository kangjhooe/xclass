'use client';

import { useRef, useEffect, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface UseSwipeOptions extends SwipeHandlers {
  threshold?: number; // Minimum distance for swipe (px)
  velocity?: number; // Minimum velocity for swipe (px/ms)
  preventDefault?: boolean;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocity = 0.3,
  preventDefault = true,
}: UseSwipeOptions) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    const time = touchEnd.time - touchStart.time;
    const velocityValue = distance / time;

    const isLeftSwipe = distanceX > minSwipeDistance && Math.abs(distanceY) < Math.abs(distanceX);
    const isRightSwipe = distanceX < -minSwipeDistance && Math.abs(distanceY) < Math.abs(distanceX);
    const isUpSwipe = distanceY > minSwipeDistance && Math.abs(distanceX) < Math.abs(distanceY);
    const isDownSwipe = distanceY < -minSwipeDistance && Math.abs(distanceX) < Math.abs(distanceY);

    if (velocityValue > velocity) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      }
      if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

