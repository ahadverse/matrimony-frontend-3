'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SwipeCard } from './SwipeCard';
import { SwipeActions } from './SwipeActions';
import type { SwipeAction } from './useSwipeGesture';
import type { BrowseCard } from '@/lib/types';

interface SwipeStackProps {
  cards: BrowseCard[];
  onSwipe: (card: BrowseCard, action: SwipeAction) => void;
}

export function SwipeStack({ cards, onSwipe }: SwipeStackProps) {
  // The direction the leaving card should fly. It lives here rather than on
  // the card because a card's props can't be updated once it's unmounting —
  // AnimatePresence forwards this as `custom` to the exiting card's dynamic
  // `exit` variant, which is the only channel that still reaches it.
  const [exitAction, setExitAction] = useState<SwipeAction | null>(null);
  const visible = cards.slice(0, 3);
  const top = visible[0];

  // Single commit path for drags, buttons and arrow keys, so the exit
  // direction is always recorded before the card leaves the deck.
  function commit(card: BrowseCard, action: SwipeAction) {
    setExitAction(action);
    onSwipe(card, action);
  }

  return (
    <div>
      {/* Shorter below `lg`: that's exactly where BottomTabBar is fixed onscreen
          eating real viewport height, so the full 72dvh card left the action
          row (reject/superlike/like, rendered after this) below the fold. */}
      <div className="relative mx-auto h-[min(56dvh,480px)] w-full max-w-[420px] lg:h-[min(72dvh,560px)]">
        <AnimatePresence custom={exitAction} onExitComplete={() => setExitAction(null)}>
          {visible.map((card, index) => (
            <SwipeCard
              key={card.id}
              card={card}
              isTop={index === 0}
              stackIndex={index}
              onSwipe={(action) => commit(card, action)}
            />
          ))}
        </AnimatePresence>
      </div>
      <SwipeActions
        disabled={!top}
        onReject={() => top && commit(top, 'reject')}
        onLike={() => top && commit(top, 'like')}
        onSuperlike={() => top && commit(top, 'superlike')}
      />
    </div>
  );
}
