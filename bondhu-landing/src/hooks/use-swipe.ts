"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
  direction: "left" | "right" | "up" | "down" | null;
}

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScroll?: boolean;
}

const initialState: SwipeState = {
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  deltaX: 0,
  deltaY: 0,
  isSwiping: false,
  direction: null,
};

export function useSwipe<T extends HTMLElement = HTMLDivElement>(
  options: UseSwipeOptions = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventScroll = false,
  } = options;

  const ref = useRef<T>(null);
  const [state, setState] = useState<SwipeState>(initialState);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setState({
      ...initialState,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: true,
    });
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!state.isSwiping) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      // Determine direction
      let direction: SwipeState["direction"] = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      // Prevent vertical scroll if swiping horizontally
      if (preventScroll && direction && ["left", "right"].includes(direction)) {
        e.preventDefault();
      }

      setState((prev) => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX,
        deltaY,
        direction,
      }));
    },
    [state.isSwiping, state.startX, state.startY, preventScroll]
  );

  const handleTouchEnd = useCallback(() => {
    if (!state.isSwiping) return;

    const { deltaX, deltaY, direction } = state;

    // Check if swipe exceeded threshold
    if (Math.abs(deltaX) >= threshold || Math.abs(deltaY) >= threshold) {
      switch (direction) {
        case "left":
          onSwipeLeft?.();
          break;
        case "right":
          onSwipeRight?.();
          break;
        case "up":
          onSwipeUp?.();
          break;
        case "down":
          onSwipeDown?.();
          break;
      }
    }

    setState(initialState);
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: !preventScroll });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  return {
    ref,
    state,
    isSwiping: state.isSwiping,
    direction: state.direction,
    deltaX: state.deltaX,
    deltaY: state.deltaY,
  };
}

// Hook for pull-to-refresh functionality
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

export function usePullToRefresh(options: UsePullToRefreshOptions) {
  const { onRefresh, threshold = 80, maxPull = 120 } = options;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only enable pull-to-refresh when at top of page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.min(currentY - startY.current, maxPull);

      if (distance > 0) {
        setPullDistance(distance);
        if (distance > 20) {
          e.preventDefault();
        }
      }
    },
    [isRefreshing, maxPull]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / threshold, 1),
    shouldRefresh: pullDistance >= threshold,
  };
}
