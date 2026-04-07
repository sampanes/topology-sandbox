import { useCallback, useEffect, useRef, useState } from "react";
import {
  NUMERAL_BY_ID,
  NUMERAL_IDS,
  type NumeralId,
} from "./numerals";

const TIERS = [
  {
    id: "s",
    label: "S",
    description: "S-TIER",
    gradient: "from-yellow-400 via-amber-400 to-yellow-500",
    bgLight: "rgba(251, 191, 36, 0.08)",
    bgLightHover: "rgba(251, 191, 36, 0.15)",
    borderColor: "rgba(251, 191, 36, 0.4)",
    glowColor: "rgba(251, 191, 36, 0.3)",
    textColor: "#D97706",
  },
  {
    id: "a",
    label: "A",
    description: "A-TIER",
    gradient: "from-gray-300 via-gray-400 to-gray-500",
    bgLight: "rgba(156, 163, 175, 0.08)",
    bgLightHover: "rgba(156, 163, 175, 0.15)",
    borderColor: "rgba(156, 163, 175, 0.4)",
    glowColor: "rgba(156, 163, 175, 0.3)",
    textColor: "#6B7280",
  },
  {
    id: "b",
    label: "B",
    description: "B-TIER",
    gradient: "from-amber-600 via-amber-700 to-amber-800",
    bgLight: "rgba(180, 83, 9, 0.08)",
    bgLightHover: "rgba(180, 83, 9, 0.15)",
    borderColor: "rgba(180, 83, 9, 0.4)",
    glowColor: "rgba(180, 83, 9, 0.3)",
    textColor: "#B45309",
  },
] as const;

const ITEM_SIZE = 64;
const ITEM_GAP = 10;
const ITEM_SLOT = ITEM_SIZE + ITEM_GAP;
const PLACEHOLDER_ID = "__placeholder__";

const getScatteredStyle = (itemId: NumeralId) => {
  const seed = Array.from(itemId).reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );
  const rotation = ((seed * 137) % 70) - 35;
  const offsetX = ((seed * 197) % 46) - 23;
  const offsetY = ((seed * 223) % 34) - 17;
  const scale = 0.92 + (((seed * 251) % 18) / 100);

  return {
    transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
    zIndex: (seed % 6) + 1,
  };
};

interface DragState {
  itemId: NumeralId;
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
  const [tierItems, setTierItems] = useState<Record<string, NumeralId[]>>({
    s: [],
    a: [],
    b: [],
  });
  const [poolItems, setPoolItems] = useState<NumeralId[]>(() => [...NUMERAL_IDS]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    tierId: string | null;
    index: number;
  } | null>(null);

  const tierRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const poolRef = useRef<HTMLDivElement | null>(null);
  const poolGridRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const getPointerPos = useCallback((e: PointerEvent | React.PointerEvent) => {
    return { x: e.clientX, y: e.clientY };
  }, []);

  const findItemLocation = useCallback(
    (itemId: NumeralId): { tierId: string | null; index: number } => {
      for (const tier of TIERS) {
        const idx = tierItems[tier.id].indexOf(itemId);
        if (idx !== -1) {
          return { tierId: tier.id, index: idx };
        }
      }

      const idx = poolItems.indexOf(itemId);
      if (idx !== -1) {
        return { tierId: null, index: idx };
      }

      return { tierId: null, index: 0 };
    },
    [poolItems, tierItems]
  );

  const getItemLists = useCallback(() => {
    const lists: Record<string, NumeralId[]> = { pool: [...poolItems] };

    for (const tier of TIERS) {
      lists[tier.id] = [...tierItems[tier.id]];
    }

    return lists;
  }, [poolItems, tierItems]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, itemId: NumeralId) => {
      if (e.button !== 0) {
        return;
      }

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
    },
    [findItemLocation, getPointerPos]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state) {
        return;
      }

      const pos = { x: e.clientX, y: e.clientY };

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

      if (!state.isDragging) {
        return;
      }

      let bestTarget: { tierId: string | null; index: number } | null = null;
      let bestDist = Infinity;

      for (const tier of TIERS) {
        const el = tierRefs.current[tier.id];
        if (!el) {
          continue;
        }

        const rect = el.getBoundingClientRect();
        const labelWidth = 80;

        if (
          pos.y >= rect.top &&
          pos.y <= rect.bottom &&
          pos.x >= rect.left + labelWidth
        ) {
          const itemsInTier = tierItems[tier.id];
          const dropX = pos.x - rect.left - labelWidth - 16;
          const insertIndex = Math.round(dropX / ITEM_SLOT);
          const clampedIndex = Math.max(
            0,
            Math.min(insertIndex, itemsInTier.length)
          );
          const dist = Math.abs(pos.y - (rect.top + rect.height / 2));

          if (dist < bestDist) {
            bestDist = dist;
            bestTarget = { tierId: tier.id, index: clampedIndex };
          }
        }
      }

      const poolEl = poolRef.current;
      const gridEl = poolGridRef.current;
      if (poolEl && gridEl) {
        const poolRect = poolEl.getBoundingClientRect();
        const gridRect = gridEl.getBoundingClientRect();
        if (
          pos.y >= poolRect.top &&
          pos.y <= poolRect.bottom &&
          pos.x >= poolRect.left &&
          pos.x <= poolRect.right
        ) {
          const COL_SLOT = ITEM_SIZE + 32; // gap-x-8 = 32px
          const ROW_SLOT = ITEM_SIZE + 40; // gap-y-10 = 40px
          const numCols = Math.max(1, Math.round(gridRect.width / COL_SLOT));
          const col = Math.max(0, Math.min(Math.floor((pos.x - gridRect.left) / COL_SLOT), numCols - 1));
          const row = Math.max(0, Math.floor((pos.y - gridRect.top) / ROW_SLOT));
          const insertIndex = Math.max(0, Math.min(row * numCols + col, poolItems.length));
          const dist = Math.abs(pos.y - (poolRect.top + poolRect.height / 2));

          if (dist < bestDist) {
            bestDist = dist;
            bestTarget = { tierId: null, index: insertIndex };
          }
        }
      }

      setDropTarget(bestTarget);
    },
    [poolItems.length, tierItems]
  );

  const handlePointerUp = useCallback(() => {
    const state = dragStateRef.current;
    if (!state || !state.hasMoved) {
      setDragState(null);
      setDropTarget(null);
      return;
    }

    if (dropTarget) {
      const lists = getItemLists();
      const sourceListKey = state.sourceTier ?? "pool";
      const sourceList = lists[sourceListKey];
      const [removed] = sourceList.splice(state.sourceIndex, 1);

      const targetListKey = dropTarget.tierId ?? "pool";
      const targetList = lists[targetListKey];
      let insertIdx = dropTarget.index;

      if (sourceListKey === targetListKey && state.sourceIndex < dropTarget.index) {
        insertIdx = Math.max(0, insertIdx - 1);
      }

      insertIdx = Math.max(0, Math.min(insertIdx, targetList.length));
      targetList.splice(insertIdx, 0, removed);

      const newTierItems: Record<string, NumeralId[]> = {};
      for (const tier of TIERS) {
        newTierItems[tier.id] = lists[tier.id];
      }

      setTierItems(newTierItems);
      setPoolItems(lists.pool);
    }

    setDragState(null);
    setDropTarget(null);
  }, [dropTarget, getItemLists]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    if (dragState) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    }

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragState, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    if (dragState?.isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragState?.isDragging]);

  const isDraggingItem = dragState?.isDragging ?? false;
  const draggedItemId = dragState?.itemId;

  const getDisplayItems = (tierId: string | null) => {
    const key = tierId ?? "pool";
    const items = key === "pool" ? poolItems : tierItems[key];

    if (!dropTarget || !isDraggingItem) {
      return items;
    }

    const targetKey = dropTarget.tierId ?? "pool";
    if (key !== targetKey) {
      return items;
    }

    const result = [...items];
    result.splice(dropTarget.index, 0, PLACEHOLDER_ID as NumeralId);
    return result;
  };

  return (
    <div className="min-h-screen select-none bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 pt-4 text-center">
          <div className="mb-5 flex justify-center">
            <a
              href="#"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 transition hover:border-amber-400/30 hover:text-amber-300"
            >
              All Projects
            </a>
          </div>
          <h1 className="mb-2 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-6xl">
            Objective Rankings
          </h1>
          <p className="text-base font-medium text-slate-500 md:text-lg">
            Rankings that are objective and based entirely on provable fact
          </p>
        </div>

        <div className="mb-8 space-y-4">
          {TIERS.map((tier) => {
            const displayItems = getDisplayItems(tier.id);
            const isDropTarget = dropTarget?.tierId === tier.id && isDraggingItem;

            return (
              <div
                key={tier.id}
                ref={(el) => {
                  tierRefs.current[tier.id] = el;
                }}
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  isDropTarget ? "ring-2 ring-offset-2 ring-offset-slate-950" : ""
                }`}
                style={{
                  backgroundColor: isDropTarget ? tier.bgLightHover : tier.bgLight,
                  boxShadow: isDropTarget
                    ? `0 0 30px ${tier.glowColor}, inset 0 0 30px ${tier.bgLight}`
                    : "none",
                  borderColor: tier.borderColor,
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
              >
                <div className="flex min-h-[90px] md:min-h-[100px]">
                  <div
                    className={`relative flex w-20 flex-shrink-0 flex-col items-center justify-center bg-gradient-to-b ${tier.gradient} md:w-24`}
                  >
                    <span className="text-2xl font-black text-white drop-shadow-lg md:text-3xl">
                      {tier.label}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80 md:text-xs">
                      {tier.description}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  <div className="flex min-h-[80px] flex-1 flex-wrap content-start items-center gap-2.5 p-3 md:p-4">
                    {displayItems.length === 0 ? (
                      <div className="flex h-full w-full items-center justify-center py-4 text-sm italic text-slate-600">
                        Drop digits here
                      </div>
                    ) : (
                      displayItems.map((itemId, idx) => {
                        if (itemId === PLACEHOLDER_ID) {
                          return (
                            <div
                              key={`placeholder-${idx}`}
                              className="h-16 w-16 flex-shrink-0 animate-pulse rounded-xl border-2 border-dashed"
                              style={{
                                borderColor: tier.borderColor,
                                backgroundColor: tier.bgLight,
                              }}
                            />
                          );
                        }

                        const numeral = NUMERAL_BY_ID[itemId];
                        const isBeingDragged = draggedItemId === itemId && isDraggingItem;

                        return (
                          <div
                            key={itemId}
                            onPointerDown={(e) => handlePointerDown(e, itemId)}
                            className={`flex h-16 w-16 flex-shrink-0 cursor-grab items-center justify-center rounded-xl border-2 border-slate-200/80 bg-white/90 p-2.5 backdrop-blur-sm transition-all duration-200 active:cursor-grabbing hover:scale-105 hover:border-slate-300 hover:shadow-lg ${
                              isBeingDragged ? "scale-95 opacity-30" : "opacity-100"
                            }`}
                            style={{ touchAction: "none" }}
                            title={numeral.variantLabel ?? `Digit ${numeral.label}`}
                          >
                            <div className="h-full w-full" style={{ color: tier.textColor }}>
                              {numeral.svg}
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

        <div
          ref={poolRef}
          className={`rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm transition-all duration-300 md:p-8 ${
            dropTarget?.tierId === null && isDraggingItem
              ? "ring-2 ring-indigo-400/50 bg-slate-800/60"
              : ""
          }`}
        >
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Choices
          </h2>
          <p className="mb-6 text-xs text-slate-500">
            Funky lil choices to chose from
          </p>
          <div ref={poolGridRef} className="grid min-h-[180px] grid-cols-6 justify-items-center gap-x-8 gap-y-10 px-4 py-3 max-[720px]:grid-cols-4 max-[520px]:grid-cols-3">
            {getDisplayItems(null).map((itemId, idx) => {
              if (itemId === PLACEHOLDER_ID) {
                return (
                  <div
                    key={`placeholder-${idx}`}
                    className="h-16 w-16 flex-shrink-0 animate-pulse rounded-xl border-2 border-dashed border-indigo-400/40 bg-indigo-400/5"
                  />
                );
              }

              const numeral = NUMERAL_BY_ID[itemId];
              const isBeingDragged = draggedItemId === itemId && isDraggingItem;

              return (
                <div
                  key={itemId}
                  onPointerDown={(e) => handlePointerDown(e, itemId)}
                  className={`relative flex h-16 w-16 cursor-grab items-center justify-center rounded-xl border-2 border-slate-200/80 bg-white/90 p-2.5 backdrop-blur-sm transition-all duration-200 active:cursor-grabbing hover:rotate-0 hover:scale-110 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 ${
                    isBeingDragged ? "scale-95 opacity-30" : "opacity-100"
                  }`}
                  style={{
                    touchAction: "none",
                    ...(!isBeingDragged ? getScatteredStyle(itemId) : {}),
                  }}
                  title={numeral.variantLabel ?? `Digit ${numeral.label}`}
                >
                  <div className="h-full w-full text-indigo-500">{numeral.svg}</div>
                </div>
              );
            })}

            {poolItems.length === 0 && !isDraggingItem && (
              <div className="flex w-full items-center justify-center py-4 text-sm italic text-slate-600">
                All digits have been placed
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs font-medium text-slate-600">
          <p>Click and drag any item to move it between tiers or rearrange it</p>
        </div>
      </div>

      {isDraggingItem && draggedItemId && (
        <div
          className="fixed z-[100] flex h-20 w-20 pointer-events-none items-center justify-center rounded-xl border-2 border-indigo-400 bg-white p-3 shadow-2xl shadow-indigo-500/30"
          style={{
            left: dragState.currentX,
            top: dragState.currentY,
            transform: "translate(-50%, -50%) scale(1.15)",
            transition: "transform 0.1s ease-out",
          }}
        >
          <div className="h-full w-full text-indigo-600">
            {NUMERAL_BY_ID[draggedItemId].svg}
          </div>
        </div>
      )}
    </div>
  );
}
