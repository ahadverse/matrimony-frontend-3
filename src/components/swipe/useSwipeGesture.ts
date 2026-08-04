'use client';

import { animate, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'framer-motion';

export type SwipeAction = 'like' | 'reject' | 'superlike';

const SWIPE_THRESHOLD = 120;
const SUPERLIKE_THRESHOLD = -110;
// A fast, short flick should commit even if it never crosses the offset
// threshold — the original port only checked offset, so a quick flick with
// little travel did nothing.
const VELOCITY_THRESHOLD = 600;

const SPRING_BACK = { type: 'spring', stiffness: 400, damping: 30 } as const;

/**
 * Headless drag-to-swipe gesture: motion values, stamp opacity transforms,
 * and the commit/spring-back decision. Kept separate from SwipeCard so the
 * six concerns the original implementation fused together (thresholds,
 * motion values, stamps, exit animation, stack depth, profile layout) don't
 * all live in one file, and so keyboard/reduced-motion support has one home.
 */
export function useSwipeGesture(onCommit: (action: SwipeAction) => void) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], prefersReducedMotion ? [0, 0] : [-18, 18]);

  const likeOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);
  const superOpacity = useTransform(y, [SUPERLIKE_THRESHOLD, -20], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;

    const verticalByOffset = offset.y < SUPERLIKE_THRESHOLD && Math.abs(offset.y) > Math.abs(offset.x);
    const verticalByFlick = velocity.y < -VELOCITY_THRESHOLD && Math.abs(velocity.y) > Math.abs(velocity.x);
    if (verticalByOffset || verticalByFlick) {
      onCommit('superlike');
      return;
    }

    if (offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) {
      onCommit('like');
      return;
    }

    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) {
      onCommit('reject');
      return;
    }

    // Under every threshold: spring back to center. The original port had no
    // dragConstraints and no snap-back, so releasing a short drag just left
    // the card wherever it was dropped.
    animate(x, 0, SPRING_BACK);
    animate(y, 0, SPRING_BACK);
  }

  return {
    x,
    y,
    rotate,
    likeOpacity,
    nopeOpacity,
    superOpacity,
    dragProps: {
      drag: true as const,
      dragElastic: 0.6,
      onDragEnd: handleDragEnd,
    },
  };
}
