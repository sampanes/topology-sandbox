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
        <path d="M50 15 C30 15 20 35 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 35 70 15 50 15 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="50" cy="50" rx="25" ry="35" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="5,3" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "1",
    label: "1",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M55 20 L45 25 L45 80 L35 85 L40 90 L60 85 L60 25 L75 20 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M45 35 L55 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "2",
    label: "2",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M25 25 C35 15 65 15 75 25 C80 30 80 40 70 50 L30 80 L80 80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 30 C40 25 60 25 65 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "3",
    label: "3",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M30 20 C50 15 70 20 75 35 C78 45 70 50 60 50 C70 50 80 55 80 70 C78 85 55 90 30 85" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 30 C55 25 65 30 68 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "4",
    label: "4",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M60 15 L35 60 L25 60 L25 70 L35 70 L35 85 L45 85 L45 70 L70 70 L70 60 L45 60 L65 25 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 50 L55 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "5",
    label: "5",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M70 20 L40 20 L35 40 L45 45 C60 35 75 45 75 60 C75 75 60 85 40 85 C25 85 20 75 20 65" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M45 50 C55 45 65 50 68 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "6",
    label: "6",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M60 20 C40 15 25 30 25 50 C25 70 40 85 55 85 C70 85 80 75 80 65 C80 55 70 50 55 50 C40 50 35 60 35 65" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="50" cy="65" rx="15" ry="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "7",
    label: "7",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M25 20 L75 20 L50 85 L40 85 L60 30 L30 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 25 L65 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "8",
    label: "8",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <ellipse cx="50" cy="35" rx="25" ry="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="50" cy="65" rx="28" ry="22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="50" cy="35" rx="15" ry="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "9",
    label: "9",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M40 80 C60 85 75 70 75 50 C75 30 60 15 45 15 C30 15 20 25 20 35 C20 45 30 50 45 50 C60 50 65 40 65 35" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="50" cy="35" rx="15" ry="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: "2-curly",
    label: "2",
    variantLabel: "Curly 2",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M26 28 C34 16 56 14 69 22 C78 28 79 41 70 49 C62 56 47 60 39 67 C31 73 31 81 42 82 L74 82" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M39 31 C45 24 58 24 63 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      </svg>
    ),
  },
  {
    id: "4-boxy",
    label: "4",
    variantLabel: "Boxy 4",
    svg: (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path d="M62 18 L30 18 L30 54 L64 54 L64 84 M64 18 L64 84" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 54 L74 54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      </svg>
    ),
  },
];

export const NUMERAL_IDS = NUMERAL_DEFINITIONS.map(({ id }) => id);

export const NUMERAL_BY_ID = Object.fromEntries(
  NUMERAL_DEFINITIONS.map((definition) => [definition.id, definition])
) as Record<NumeralId, NumeralDefinition>;
