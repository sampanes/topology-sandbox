import { useState, useRef, useCallback, useEffect } from 'react';

// ============================================
// HAND-DRAWN NUMERAL SVGs - Edit these freely!
// Each numeral is a unique hand-drawn style SVG
// ============================================
const handDrawnNumerals: Record<number, React.ReactNode> = {
  0: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M50 15 C30 15 20 35 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 35 70 15 50 15 Z"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="50" cy="50" rx="25" ry="35" fill="none" stroke="currentColor" strokeWidth="3"
               strokeDasharray="5,3" opacity="0.6"/>
    </svg>
  ),
  1: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M55 20 L45 25 L45 80 L35 85 L40 90 L60 85 L60 25 L75 20 Z"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M45 35 L55 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  2: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M25 25 C35 15 65 15 75 25 C80 30 80 40 70 50 L30 80 L80 80"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35 30 C40 25 60 25 65 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  3: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M30 20 C50 15 70 20 75 35 C78 45 70 50 60 50 C70 50 80 55 80 70 C78 85 55 90 30 85"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 30 C55 25 65 30 68 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  4: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M60 15 L35 60 L25 60 L25 70 L35 70 L35 85 L45 85 L45 70 L70 70 L70 60 L45 60 L65 25 Z"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 50 L55 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  5: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M70 20 L40 20 L35 40 L45 45 C60 35 75 45 75 60 C75 75 60 85 40 85 C25 85 20 75 20 65"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M45 50 C55 45 65 50 68 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  6: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M60 20 C40 15 25 30 25 50 C25 70 40 85 55 85 C70 85 80 75 80 65 C80 55 70 50 55 50 C40 50 35 60 35 65"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="50" cy="65" rx="15" ry="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
    </svg>
  ),
  7: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M25 20 L75 20 L50 85 L40 85 L60 30 L30 30"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35 25 L65 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  8: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <ellipse cx="50" cy="35" rx="25" ry="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="50" cy="65" rx="28" ry="22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="50" cy="35" rx="15" ry="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
    </svg>
  ),
  9: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M40 80 C60 85 75 70 75 50 C75 30 60 15 45 15 C30 15 20 25 20 35 C20 45 30 50 45 50 C60 50 65 40 65 35"
            fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="50" cy="35" rx="15" ry="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
    </svg>
  ),
  10: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M30 25 L25 25 L25 80 L35 85 L40 80 L40 55 L55 85 L65 85 L80 25 L70 25 L60 65 L45 35 Z"
            fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  11: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M35 20 L30 25 L30 80 L40 85 L45 80 L45 25 L50 20 Z M55 20 L50 25 L50 80 L60 85 L65 80 L65 25 L70 20 Z"
            fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 35 L43 30 M57 35 L68 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
};

// ============================================
// Tier Configuration - Easy to customize!
// ============================================
const TIERS = [
  {
    id: 's',
    label: 'S',
    description: 'Supreme',
    gradient: 'from-yellow-400 via-amber-400 to-yellow-500',
    bgSolid: '#F59E0B',
    bgLight: 'rgba(251, 191, 36, 0.08)',
    bgLightHover: 'rgba(251, 191, 36, 0.15)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
    glowColor: 'rgba(251, 191, 36, 0.3)',
    textColor: '#D97706',
  },
  {
    id: 'a',
    label: 'A',
    description: 'Excellent',
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    bgSolid: '#9CA3AF',
    bgLight: 'rgba(156, 163, 175, 0.08)',
    bgLightHover: 'rgba(156, 163, 175, 0.15)',
    borderColor: 'rgba(156, 163, 175, 0.4)',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    textColor: '#6B7280',
  },
  {
    id: 'b',
    label: 'B',
    description: 'Good',
    gradient: 'from-amber-600 via-amber-700 to-amber-800',
    bgSolid: '#B45309',
    bgLight: 'rgba(180, 83, 9, 0.08)',
    bgLightHover: 'rgba(180, 83, 9, 0.15)',
    borderColor: 'rgba(180, 83, 9, 0.4)',
    glowColor: 'rgba(180, 83, 9, 0.3)',
    textColor: '#B45309',
  },
];

const ITEM_SIZE = 64; // px
const ITEM_GAP = 10; // px
const ITEM_SLOT = ITEM_SIZE + ITEM_GAP;

// Deterministic random styling for "scattered" look
const getScatteredStyle = (itemId: number) => {
  const rotation = ((itemId * 137) % 40) - 20; // -20 to 20 deg
  const offsetX = ((itemId * 197) % 30) - 15; // -15 to 15 px
  const offsetY = ((itemId * 223) % 20) - 10; // -10 to 10 px
  return {
    transform: `rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`,
  };
};

interface DragState {
  itemId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  hasMoved: boolean;
  sourceTier: string | null;
  sourceIndex: number;
}

export default function App() {
  // tierItems: Record<tierId, number[]> where array is ordered list of item ids
  const [tierItems, setTierItems] = useState<Record<string, number[]>>({
    s: [],
    a: [],
    b: [],
  });

  // poolItems: ordered list of item ids not in any tier
  const [poolItems, setPoolItems] = useState<number[]>(() =>
    Array.from({ length: 12 }, (_, i) => i)
  );

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<{ tierId: string | null; index: number } | null>(null);

  const tierRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const poolRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  // Keep ref in sync
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const getPointerPos = useCallback((e: PointerEvent | React.PointerEvent) => {
    return { x: e.clientX, y: e.clientY };
  }, []);

  const findItemLocation = useCallback((itemId: number): { tierId: string | null; index: number } => {
    for (const tier of TIERS) {
      const idx = tierItems[tier.id].indexOf(itemId);
      if (idx !== -1) return { tierId: tier.id, index: idx };
    }
    const idx = poolItems.indexOf(itemId);
    if (idx !== -1) return { tierId: null, index: idx };
    return { tierId: null, index: 0 };
  }, [tierItems, poolItems]);

  const getItemLists = useCallback(() => {
    const lists: Record<string, number[]> = { pool: [...poolItems] };
    for (const tier of TIERS) {
      lists[tier.id] = [...tierItems[tier.id]];
    }
    return lists;
  }, [tierItems, poolItems]);

  const handlePointerDown = useCallback((e: React.PointerEvent, itemId: number) => {
    if (e.button !== 0) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const pos = getPointerPos(e);
    const loc = findItemLocation(itemId);

    const state: DragState = {
      itemId,
      startX: pos.x,
      startY: pos.y,
      currentX: pos.x,
      currentY: pos.y,
      isDragging: false,
      hasMoved: false,
      sourceTier: loc.tierId,
      sourceIndex: loc.index,
    };

    setDragState(state);
    dragStateRef.current = state;
  }, [getPointerPos, findItemLocation]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const state = dragStateRef.current;
    if (!state) return;

    const pos = { x: e.clientX, y: e.clientY };

    // Start dragging after 5px threshold
    if (!state.isDragging) {
      const dx = pos.x - state.startX;
      const dy = pos.y - state.startY;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        state.isDragging = true;
        state.hasMoved = true;
      }
    }

    state.currentX = pos.x;
    state.currentY = pos.y;
    setDragState({ ...state });

    if (!state.isDragging) return;

    // Find which tier/pool we're hovering over
    let bestTarget: { tierId: string | null; index: number } | null = null;
    let bestDist = Infinity;

    // Check tiers
    for (const tier of TIERS) {
      const el = tierRefs.current[tier.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();

      // Check if cursor is within the tier's drop area (right of the label)
      const labelWidth = 80;
      if (pos.y >= rect.top && pos.y <= rect.bottom && pos.x >= rect.left + labelWidth) {
        const itemsInTier = tierItems[tier.id];
        // Calculate insertion index based on x position
        const dropX = pos.x - rect.left - labelWidth - 16; // account for padding
        const insertIndex = Math.round(dropX / ITEM_SLOT);
        const clampedIndex = Math.max(0, Math.min(insertIndex, itemsInTier.length));

        // Distance to tier center (prefer closer tiers)
        const dist = Math.abs(pos.y - (rect.top + rect.height / 2));
        if (dist < bestDist) {
          bestDist = dist;
          bestTarget = { tierId: tier.id, index: clampedIndex };
        }
      }
    }

    // Check pool
    const poolEl = poolRef.current;
    if (poolEl) {
      const rect = poolEl.getBoundingClientRect();
      if (pos.y >= rect.top && pos.y <= rect.bottom) {
        const itemsInPool = poolItems;
        const dropX = pos.x - rect.left - 24;
        const cols = Math.floor((rect.width - 48) / ITEM_SLOT);
        const row = Math.floor(dropX / (cols * ITEM_SLOT));
        const col = Math.floor((dropX - row * cols * ITEM_SLOT) / ITEM_SLOT);
        const insertIndex = Math.max(0, Math.min(row * cols + col, itemsInPool.length));

        const dist = Math.abs(pos.y - (rect.top + rect.height / 2));
        if (dist < bestDist) {
          bestDist = dist;
          bestTarget = { tierId: null, index: insertIndex };
        }
      }
    }

    setDropTarget(bestTarget);
  }, [tierItems, poolItems]);

  const handlePointerUp = useCallback(() => {
    const state = dragStateRef.current;
    if (!state || !state.hasMoved) {
      setDragState(null);
      setDropTarget(null);
      return;
    }

    const target = dropTarget;
    if (target) {
      const lists = getItemLists();
      const sourceListKey = state.sourceTier ?? 'pool';
      const sourceList = lists[sourceListKey];

      // Remove from source
      const [removed] = sourceList.splice(state.sourceIndex, 1);

      // Insert into target
      const targetListKey = target.tierId ?? 'pool';
      const targetList = lists[targetListKey];
      // Adjust index if removing from same list
      let insertIdx = target.index;
      if (sourceListKey === targetListKey && state.sourceIndex < target.index) {
        insertIdx = Math.max(0, insertIdx - 1);
      }
      insertIdx = Math.max(0, Math.min(insertIdx, targetList.length));
      targetList.splice(insertIdx, 0, removed);

      // Update state
      const newTierItems: Record<string, number[]> = {};
      for (const tier of TIERS) {
        newTierItems[tier.id] = lists[tier.id];
      }
      setTierItems(newTierItems);
      setPoolItems(lists.pool);
    }

    setDragState(null);
    setDropTarget(null);
  }, [dropTarget, getItemLists]);

  // Global pointer events
  useEffect(() => {
    const onMove = (e: PointerEvent) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    if (dragState) {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragState, handlePointerMove, handlePointerUp]);

  // Prevent text selection during drag
  useEffect(() => {
    if (dragState?.isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [dragState?.isDragging]);

  const isDraggingItem = dragState?.isDragging ?? false;
  const draggedItemId = dragState?.itemId;

  // Build display lists with drop indicator
  const getDisplayItems = (tierId: string | null) => {
    const key = tierId ?? 'pool';
    const items = key === 'pool' ? poolItems : tierItems[key];
    const target = dropTarget;

    if (!target || !isDraggingItem) return items;

    const targetKey = target.tierId ?? 'pool';
    if (key !== targetKey) return items;

    // Show a placeholder at the drop index
    const result = [...items];
    // If dragging from this list, the item is already removed conceptually
    // so we just insert a placeholder
    const placeholder = -1;
    result.splice(target.index, 0, placeholder);
    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 md:p-6 select-none">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <div className="mb-5 flex justify-center">
            <a
              href="#"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"
            >
              All Projects
            </a>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 mb-2 tracking-tight">
            Number Rankings
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium">
            Drag numbers into tiers · Rearrange freely
          </p>
        </div>

        {/* Tier Rows */}
        <div className="space-y-4 mb-8">
          {TIERS.map((tier) => {
            const displayItems = getDisplayItems(tier.id);
            const isDropTarget = dropTarget?.tierId === tier.id && isDraggingItem;

            return (
              <div
                key={tier.id}
                ref={(el) => { tierRefs.current[tier.id] = el; }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300
                  ${isDropTarget ? 'ring-2 ring-offset-2 ring-offset-slate-950' : ''}`}
                style={{
                  backgroundColor: isDropTarget ? tier.bgLightHover : tier.bgLight,
                  boxShadow: isDropTarget ? `0 0 30px ${tier.glowColor}, inset 0 0 30px ${tier.bgLight}` : 'none',
                  borderColor: tier.borderColor,
                  borderWidth: 1,
                  borderStyle: 'solid',
                }}
              >
                <div className="flex min-h-[90px] md:min-h-[100px]">
                  {/* Tier Label */}
                  <div
                    className={`flex-shrink-0 w-20 md:w-24 flex flex-col items-center justify-center
                      bg-gradient-to-b ${tier.gradient} relative`}
                  >
                    <span className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
                      {tier.label}
                    </span>
                    <span className="text-[10px] md:text-xs font-semibold text-white/80 uppercase tracking-widest">
                      {tier.description}
                    </span>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  {/* Drop Zone */}
                  <div className="flex-1 p-3 md:p-4 flex items-center gap-2.5 flex-wrap content-start min-h-[80px]">
                    {displayItems.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm italic py-4">
                        Drop numbers here
                      </div>
                    ) : (
                      displayItems.map((itemId, idx) => {
                        if (itemId === -1) {
                          // Drop placeholder
                          return (
                            <div
                              key={`placeholder-${idx}`}
                              className="w-16 h-16 rounded-xl border-2 border-dashed animate-pulse flex-shrink-0"
                              style={{ borderColor: tier.borderColor, backgroundColor: tier.bgLight }}
                            />
                          );
                        }

                        const isBeingDragged = draggedItemId === itemId && isDraggingItem;

                        return (
                          <div
                            key={itemId}
                            onPointerDown={(e) => handlePointerDown(e, itemId)}
                            className={`w-16 h-16 flex-shrink-0 rounded-xl cursor-grab
                              active:cursor-grabbing transition-all duration-200
                              bg-white/90 backdrop-blur-sm
                              flex items-center justify-center p-2.5
                              border-2 border-slate-200/80
                              hover:border-slate-300 hover:shadow-lg hover:scale-105
                              ${isBeingDragged ? 'opacity-30 scale-95' : 'opacity-100'}`}
                            style={{
                              touchAction: 'none',
                            }}
                          >
                            <div className="w-full h-full" style={{ color: tier.textColor }}>
                              {handDrawnNumerals[itemId]}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Item Pool */}
        <div
          ref={poolRef}
          className={`bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700/50
            transition-all duration-300
            ${dropTarget?.tierId === null && isDraggingItem ? 'ring-2 ring-indigo-400/50 bg-slate-800/60' : ''}`}
        >
          <h2 className="text-slate-400 text-sm font-semibold mb-6 flex items-center gap-2 uppercase tracking-wider">
            Available Numbers
          </h2>
          <div className="flex flex-wrap gap-6 min-h-[120px] content-start justify-center">
            {getDisplayItems(null).map((itemId, idx) => {
              if (itemId === -1) {
                return (
                  <div
                    key={`placeholder-${idx}`}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-indigo-400/40 animate-pulse flex-shrink-0 bg-indigo-400/5"
                  />
                );
              }

              const isBeingDragged = draggedItemId === itemId && isDraggingItem;

              return (
                <div
                  key={itemId}
                  onPointerDown={(e) => handlePointerDown(e, itemId)}
                  className={`w-16 h-16 flex-shrink-0 rounded-xl cursor-grab active:cursor-grabbing
                    transition-all duration-200 bg-white/90 backdrop-blur-sm
                    flex items-center justify-center p-2.5
                    border-2 border-slate-200/80 hover:border-indigo-300
                    hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-110 hover:rotate-0
                    ${isBeingDragged ? 'opacity-30 scale-95' : 'opacity-100'}`}
                  style={{ 
                    touchAction: 'none',
                    ...(!isBeingDragged ? getScatteredStyle(itemId) : {})
                  }}
                >
                  <div className="w-full h-full text-indigo-500">
                    {handDrawnNumerals[itemId]}
                  </div>
                </div>
              );
            })}
            {poolItems.length === 0 && !isDraggingItem && (
              <div className="w-full flex items-center justify-center text-slate-600 text-sm italic py-4">
                All numbers have been placed!
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-slate-600 text-xs font-medium">
          <p>Click &amp; drag any number to move it between tiers or rearrange within a tier</p>
        </div>
      </div>

      {/* Floating Dragged Item */}
      {isDraggingItem && draggedItemId !== null && (
        <div
          className="fixed pointer-events-none z-[100] w-20 h-20
            bg-white rounded-xl shadow-2xl shadow-indigo-500/30
            flex items-center justify-center p-3 border-2 border-indigo-400"
          style={{
            left: dragState!.currentX,
            top: dragState!.currentY,
            transform: 'translate(-50%, -50%) scale(1.15)',
            transition: 'transform 0.1s ease-out',
          }}
        >
          <div className="w-full h-full text-indigo-600">
            {handDrawnNumerals[draggedItemId as number]}
          </div>
        </div>
      )}
    </div>
  );
}
