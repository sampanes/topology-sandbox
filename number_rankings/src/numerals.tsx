import type { ReactNode } from "react";

export type NumeralId =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "2-curly"
  | "4-boxy";

export interface NumeralDefinition {
  id: NumeralId;
  label: string;
  variantLabel?: string;
  svg: ReactNode;
}

export const NUMERAL_DEFINITIONS: NumeralDefinition[] = [
  {
    id: "0",
    label: "0",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M50 14 C72 14 84 30 84 50 C84 70 72 86 50 86 C28 86 16 70 16 50 C16 30 28 14 50 14 Z" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "1",
    label: "1",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M38 30 L57 18 L57 82" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "2",
    label: "2",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M24 32 C28 14 74 14 76 30 C78 42 66 54 54 62 L24 82 L76 82" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "3",
    label: "3",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path
          d="M 27.5 28 C 37.5 15 72.5 15 72.5 38 C 72.5 50 57.5 50 42.5 50 C 57.5 50 72.5 50 72.5 62 C 72.5 85 37.5 85 27.5 72"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "4",
    label: "4",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M62 18 L26 64 L74 64 M62 18 L62 84" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "5",
    label: "5",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M70 20 L30 20 L26 52 C36 42 66 44 74 58 C80 70 72 84 54 86 C36 88 22 76 20 64" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "6",
    label: "6",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M65 18 C40 10 18 28 18 52 C18 74 36 88 54 86 C72 84 82 70 80 58 C78 46 64 40 50 42 C36 44 26 56 28 64" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "7",
    label: "7",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M22 20 L78 20 L44 84" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "8",
    label: "8",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <ellipse cx="50" cy="33" rx="24" ry="18" fill="none" stroke="currentColor" strokeWidth="10" />
        <ellipse cx="50" cy="67" rx="26" ry="20" fill="none" stroke="currentColor" strokeWidth="10" />
      </svg>
    ),
  },
  {
    id: "9",
    label: "9",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M35 82 C60 90 82 72 82 48 C82 26 64 12 46 14 C28 16 18 30 20 42 C22 54 36 60 50 58 C64 56 74 44 77 29" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "2-curly",
    label: "2",
    variantLabel: "Loopy 2",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path 
          d="M26 28 C34 16, 56 14, 69 22 C78 28, 79 39, 78 49 C70 100, 13 102, 30 67 C36 56, 66 52, 81 89" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    ),
  },
  {
    id: "4-boxy",
    label: "4",
    variantLabel: "Boxy 4",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M30 18 L30 54 L64 54 M64 18 L64 84" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export const NUMERAL_IDS = NUMERAL_DEFINITIONS.map(({ id }) => id);

export const NUMERAL_BY_ID = Object.fromEntries(
  NUMERAL_DEFINITIONS.map((definition) => [definition.id, definition])
) as Record<NumeralId, NumeralDefinition>;
